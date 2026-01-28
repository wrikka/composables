<script setup lang="ts">
import { onMounted, ref } from "vue";
import { type TimelineSegment, useTimeline } from "./useTimeline";

const el1 = ref<HTMLElement | null>(null);
const el2 = ref<HTMLElement | null>(null);
const el3 = ref<HTMLElement | null>(null);

const segments = ref<TimelineSegment[]>([]);

const { currentTime, duration, play, pause, seek, isPlaying } =
	useTimeline(segments);

onMounted(() => {
	if (!el1.value || !el2.value || !el3.value) return;

	segments.value = [
		{
			animation: el1.value.animate(
				[{ transform: "scale(0.5)" }, { transform: "scale(1)" }],
				{ duration: 1000, fill: "both" },
			),
			start: 0,
			end: 1000,
		},
		{
			animation: el2.value.animate(
				[{ transform: "translateX(0px)" }, { transform: "translateX(100px)" }],
				{ duration: 1000, fill: "both" },
			),
			start: 500,
			end: 1500,
		},
		{
			animation: el3.value.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: 500,
				fill: "both",
			}),
			start: 1500,
			end: 2000,
		},
	];

	// Pause all animations initially, timeline will control them
	segments.value.forEach((s) => s.animation.pause());
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-2.5 mb-5">
      <div ref="el1" class="w-12 h-12 bg-green-600"></div>
      <div ref="el2" class="w-12 h-12 bg-green-600"></div>
      <div ref="el3" class="w-12 h-12 bg-green-600"></div>
    </div>
    <div class="flex items-center gap-2.5">
      <button @click="isPlaying ? pause() : play()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <input
        type="range"
        :min="0"
        :max="duration"
        :value="currentTime"
        @input="(e) => seek(Number((e.target as HTMLInputElement).value))"
      />
      <span>{{ (currentTime / 1000).toFixed(2) }}s / {{ (duration / 1000).toFixed(2) }}s</span>
    </div>
  </div>
</template>
