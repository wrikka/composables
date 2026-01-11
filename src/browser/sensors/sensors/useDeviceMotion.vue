<template>
  <div>
    <h2>useDeviceMotion</h2>
    <p>Note: This demo requires a device with motion sensors.</p>
    <div>
      <h3>Acceleration</h3>
      <p>x: {{ acceleration.x?.toFixed(2) }}</p>
      <p>y: {{ acceleration.y?.toFixed(2) }}</p>
      <p>z: {{ acceleration.z?.toFixed(2) }}</p>
    </div>
    <div>
      <h3>Acceleration Including Gravity</h3>
      <p>x: {{ accelerationIncludingGravity.x?.toFixed(2) }}</p>
      <p>y: {{ accelerationIncludingGravity.y?.toFixed(2) }}</p>
      <p>z: {{ accelerationIncludingGravity.z?.toFixed(2) }}</p>
    </div>
    <div>
      <h3>Rotation Rate</h3>
      <p>alpha: {{ rotationRate.alpha?.toFixed(2) }}</p>
      <p>beta: {{ rotationRate.beta?.toFixed(2) }}</p>
      <p>gamma: {{ rotationRate.gamma?.toFixed(2) }}</p>
    </div>
  </div>
</template>

<script setup>
import { useDeviceMotion } from "./useDeviceMotion";

const { acceleration, accelerationIncludingGravity, rotationRate } =
	useDeviceMotion();
</script>
