<template>
  <div class="search-wrapper">
    <div class="search-box-container" :class="{ 'search-box-container-after': searched }" :style="{ backgroundImage: bgUrl }">
      <div class="input-box">
        <input type="text" class="inputing" placeholder="搜索往日图片或观星句子..." v-model="keyword" maxlength="20" @keyup.enter="doSearch"/>
        <img class="icon-search search-icon" @click="doSearch"/>
      </div>
    </div>
    <div class="search-results" :class="{ 'search-results-after': searched }" v-if="searched">
      <div class="photos-results-container">
        <div class="photos-result-title">图片</div>
        <div class="photos-results">
          <div v-if="!photos.length">无数据</div>
          <div v-for="p in photos" :key="p.objectID" class="photos-result" :style="{ backgroundImage: `url(${p.url})` }"
               @click="$router.push({ name: 'wallpaper-list', query: { scrollTo: p.objectID } })">
            <div class="photo-texts">
              <div class="photo-title">{{ p.title }}</div>
              <div class="photo-describe">{{ (p.describe||'').substring(0,20) }}...</div>
            </div>
          </div>
        </div>
      </div>
      <div class="photos-results-container">
        <div class="photos-result-title">句子</div>
        <div class="photos-results">
          <div v-if="!sentences.length">无数据</div>
          <div v-for="s in sentences" :key="s.objectID" class="sentence-texts"
               @click="$router.push({ name: 'star-watching', query: { scrollTo: s.objectID } })">
            <div class="sentence-text">
              <div class="photo-title">{{ s.sentence }}</div>
              <div class="photo-describe" style="text-align:end">——{{ s.from }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const keyword = ref('')
const searched = ref(false)
const photos = ref([])
const sentences = ref([])
const bgUrl = ref('')
let client, photoIndex, sentenceIndex

function loadAlgolia(cb) {
  if (typeof algoliasearch !== 'undefined') return cb()
  const s = document.createElement('script')
  s.src = 'https://cdn.jsdelivr.net/npm/algoliasearch@4.14.2/dist/algoliasearch-lite.umd.js'
  s.onload = cb
  s.onerror = () => window.electronAPI.outAlert('搜索服务加载失败，请检查网络连接')
  document.head.appendChild(s)
}

function doSearch() {
  if (!keyword.value) return window.electronAPI.outAlert('请输入搜索内容')
  searched.value = true
  loadAlgolia(() => {
    if (!client) {
      client = algoliasearch('PLIM4BWFMR', '493296b2dd9b5d8709021dc22375cdc5')
      photoIndex = client.initIndex('startePhotoDatabase')
      sentenceIndex = client.initIndex('starteSentenceDatabase')
    }
    photoIndex.search(keyword.value, { attributesToRetrieve: ['title','describe','url','objectID'] })
      .then(r => photos.value = r.hits)
    sentenceIndex.search(keyword.value, { attributesToRetrieve: ['sentence','from'] })
      .then(r => sentences.value = r.hits)
  })
}

onMounted(async () => {
  if (store.mainpageData?.id) {
    const dataUrl = await window.electronAPI.readCacheFile(store.mainpageData.id + '.png')
    bgUrl.value = `url('${dataUrl}')`
  }
})
</script>

<style scoped>
.search-wrapper {
  background-color: #1e1e1e;
  min-height: 100%;
}
</style>
