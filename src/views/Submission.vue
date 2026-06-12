<template>
  <div class="submission-wrapper">
    <div class="contain">
      <form class="outer-contain" @submit.prevent>
        <div style="display:flex;justify-content:center;align-items:center;flex-direction:column;gap:8px">
          <div class="submission-title">图片投稿</div>
          <div class="submission-describe">点击"提交"即代表同意<a href="https://zestela.co/starte-agreement" target="_blank"><u>许可协议</u></a>全部内容</div>
        </div>
        <div class="inner-contain">
        <input type="text" class="input-box input-box-1" placeholder="图片标题" v-model="form.title" maxlength="50"/>
        <div class="input-box input-box-2">
          <div class="hidden"><input type="file" accept="image/*" ref="fileInput" @change="onFileChange"/></div>
          <div id="dropArea" @click="openFile" @dragenter.prevent @dragover.prevent>
            <div v-if="!preview">{{ tip }}</div>
            <div v-else :id="'compress-list-item'" class="compress-list-item">
              <div class="compress-list-preview" :style="{ backgroundImage: `url(${preview})` }"></div>
            </div>
          </div>
        </div>
        <div class="input-box input-box-3">
          <textarea class="textarea-3" placeholder="图片描述" v-model="form.describe" maxlength="300"></textarea>
          <div class="textCount"><span>{{ form.describe.length }}</span> / 300</div>
        </div>
        <input type="text" class="input-box input-box-4" placeholder="投稿人署名" v-model="form.author" maxlength="50"/>
        <input type="email" class="input-box input-box-5" placeholder="投稿人邮箱" v-model="form.email" maxlength="50"/>
        <input type="text" class="input-box input-box-6" placeholder="图片版权方" v-model="form.copyright" maxlength="50"/>
      </div>
      <div style="display:flex;justify-content:center;align-items:center">
        <input class="submit-button" type="button" :value="btnText" @click="submit" :disabled="submitting"/>
      </div>
    </form>
  </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from '../utils/api'

const form = reactive({ title: '', describe: '', author: '', email: '', copyright: '' })
const fileInput = ref(null)
const preview = ref(null)
const tip = ref('点击上传图片')
const submitting = ref(false)
const btnText = ref('提交')
let selectedFile = null
let machineId = ''

window.electronAPI.getMachineId().then(r => machineId = r)

function openFile() { fileInput.value?.click() }

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 1024 * 1024 * 5) return window.electronAPI.outAlert('图片大小不超过5M！')
  if (!/\.(jpg|png|jpeg|bmp|gif|svg|webp|ico|tiff?)$/i.test(file.name)) return window.electronAPI.outAlert('必须上传图片格式！')
  selectedFile = file
  tip.value = ''
  preview.value = URL.createObjectURL(file)
}

async function submit() {
  const { title, describe, author, email, copyright } = form
  if (!title || !describe || !author || !email || !copyright || !selectedFile) {
    return window.electronAPI.outAlert('您未将所有内容填写完整！')
  }
  if (!/^\w+@\w+\.\w+$/i.test(email)) return window.electronAPI.outAlert('电子邮件格式错误！')

  submitting.value = true
  btnText.value = '提交中，请等待……'

  const fd = new FormData()
  fd.append('file', selectedFile)
  fd.append('SendMessage', `标题：${title}，描述：${describe}，署名：${author}，邮箱：${email}，版权方：${copyright}，机器码：${machineId}`)

  try {
    const data = await api('https://api.zestela.co/get-submission/get-submission.php', {
      method: 'POST', body: fd, timeout: 300000
    })
    if (data.msg === 'OK') {
      btnText.value = '提交成功'
      window.electronAPI.outAlert('提交成功！如果图片入选，我们会在七天内邮件联系你。')
    } else {
      btnText.value = '提交失败, 请重试'
      window.electronAPI.outAlert(`提交失败：${data.msg || '未知错误'}`)
    }
  } catch (e) {
    btnText.value = '提交超时, 请重试'
    window.electronAPI.outAlert('提交超时, 请重试')
  }
  submitting.value = false
  setTimeout(() => { btnText.value = '提交'; submitting.value = false }, 5000)
}
</script>

<style scoped>
.submission-wrapper {
  background-color: black;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

/* 覆盖全局 CSS 中的 position: absolute */
.contain {
  width: 100%;
  max-width: 1200px;
  position: relative !important;
  top: auto !important;
  bottom: auto !important;
  left: auto !important;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
