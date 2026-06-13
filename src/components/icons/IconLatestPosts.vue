<template>
  <svg
    :width="size"
    :height="size"
    :class="className"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g style="mix-blend-mode:passthrough"><path d="M9.5,19C14.7467,19,19,14.7467,19,9.5C19,4.25329,14.7467,0,9.5,0C4.25329,0,0,4.25329,0,9.5C0,14.7467,4.25329,19,9.5,19ZM9.5,2.23529C8.88274,2.23529,8.38235,2.73568,8.38235,3.35294L8.38235,9.96294L11.5035,13.0841L11.5038,13.0844C11.7134,13.294,11.9977,13.4118,12.2941,13.4118C12.9114,13.4118,13.4118,12.9114,13.4118,12.2941C13.4118,11.9977,13.294,11.7134,13.0844,11.5038L10.6176,9.03706L10.6176,3.35294C10.6176,2.73568,10.1173,2.23529,9.5,2.23529Z" fill-rule="evenodd" fill="#FFFFFF" fill-opacity="1"/></g>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [String, Number], default: 24 },
  className: { type: String, default: '' }
})
</script>
