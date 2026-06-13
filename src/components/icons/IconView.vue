<template>
  <svg
    :width="size"
    :height="size"
    :class="className"
    viewBox="0 0 13 8.42403507232666"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g style="mix-blend-mode:passthrough"><path d="M12.7942,4.8055Q9.94983,8.42404,6.50002,8.42404Q3.05022,8.42404,0.205838,4.8055C-0.068581,4.4564,-0.068581,3.96764,0.205838,3.61853Q3.05022,0,6.50002,0Q9.94983,0,12.7942,3.61853C13.0686,3.96764,13.0686,4.4564,12.7942,4.8055ZM6.46551,6.45834C7.70617,6.45834,8.71192,5.45259,8.71192,4.21193C8.71192,2.97127,7.70617,1.96552,6.46551,1.96552C5.22486,1.96552,4.21911,2.97127,4.21911,4.21193C4.21911,5.45259,5.22486,6.45834,6.46551,6.45834Z" fill-rule="evenodd" fill="#FFFFFF" fill-opacity="1"/></g>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [String, Number], default: 24 },
  className: { type: String, default: '' }
})
</script>
