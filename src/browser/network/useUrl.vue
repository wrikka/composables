<script setup lang="ts">
import { useUrl } from "./useUrl";

const { url, protocol, hostname, pathname, search, hash, params, setUrl } =
	useUrl();

// Set an initial URL for the demo since the default is window.location.href
setUrl("https://wrikka.com/path?query=string#hash");
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">URL Parser</h2>
    <input v-model="url" type="text" class="input w-full" placeholder="Enter a URL" />

    <div class="font-mono text-sm space-y-1 bg-gray-100 p-2 rounded">
      <p><strong>Protocol:</strong> {{ protocol }}</p>
      <p><strong>Hostname:</strong> {{ hostname }}</p>
      <p><strong>Pathname:</strong> {{ pathname }}</p>
      <p><strong>Search:</strong> {{ search }}</p>
      <p><strong>Hash:</strong> {{ hash }}</p>
      <div>
        <strong>Params:</strong>
        <pre class="p-1 text-xs">{{ JSON.stringify(params, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
