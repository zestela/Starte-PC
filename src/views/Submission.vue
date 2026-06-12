<template>
  <div class="submission-wrapper">
    <div class="submission-container">
      <div class="submission-header">
        <h1 class="submission-title">图片投稿</h1>
        <p class="submission-desc">
          点击"提交"即代表同意<a href="https://zestela.co/starte-agreement" target="_blank">许可协议</a>全部内容
        </p>
      </div>

      <form class="submission-form" @submit.prevent="submit">
        <!-- 图片上传区域 -->
        <div class="form-section upload-section">
          <div class="upload-area" @click="openFile" @dragenter.prevent @dragover.prevent>
            <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" style="display: none"/>
            <div v-if="!preview" class="upload-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p>{{ tip }}</p>
              <span class="upload-hint">支持 JPG、PNG、WebP 等格式，最大 5MB</span>
            </div>
            <div v-else class="upload-preview" :style="{ backgroundImage: `url(${preview})` }"></div>
          </div>
        </div>

        <!-- 表单字段 -->
        <div class="form-section">
          <div class="form-group">
            <label>图片标题 *</label>
            <input
              type="text"
              v-model="form.title"
              placeholder="请输入图片标题"
              maxlength="50"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>图片描述 *</label>
            <textarea
              v-model="form.describe"
              placeholder="请描述图片内容、拍摄地点或背后的故事..."
              maxlength="300"
              class="form-textarea"
              rows="4"
            ></textarea>
            <div class="char-count">{{ form.describe.length }} / 300</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>投稿人署名 *</label>
              <input
                type="text"
                v-model="form.author"
                placeholder="您的名字"
                maxlength="50"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>投稿人邮箱 *</label>
              <input
                type="email"
                v-model="form.email"
                placeholder="your@email.com"
                maxlength="50"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>图片版权方 *</label>
            <input
              type="text"
              v-model="form.copyright"
              placeholder="如为原创则填写本人署名"
              maxlength="50"
              class="form-input"
            />
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ btnText }}
          </button>
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
  background-color: #0a0a0a;
  min-height: 100%;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.submission-container {
  width: 100%;
  max-width: 800px;
}

.submission-header {
  text-align: center;
  margin-bottom: 48px;
}

.submission-title {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px 0;
}

.submission-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.submission-desc a {
  color: rgba(93, 85, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.submission-desc a:hover {
  color: rgba(93, 85, 255, 1);
}

.submission-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 8px;
}

.upload-area {
  width: 100%;
  height: 320px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  position: relative;
}

.upload-area:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(93, 85, 255, 0.3);
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.upload-placeholder svg {
  opacity: 0.5;
}

.upload-placeholder p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.upload-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}

.upload-preview {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 表单字段 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  color: #fff;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(93, 85, 255, 0.5);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
  margin-top: -4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 提交按钮 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.btn-submit {
  padding: 14px 48px;
  background: rgba(93, 85, 255, 0.9);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  background: rgba(93, 85, 255, 1);
  transform: translateY(-1px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .upload-area {
    height: 240px;
  }

  .submission-title {
    font-size: 28px;
  }
}
</style>
