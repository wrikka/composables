<script setup lang="ts">
import { ref } from "vue";
import { useGlobalSearch } from "./useGlobalSearch";

const data = ref([
	{ id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
	{ id: 2, name: "Bob", email: "bob@example.com", role: "User" },
	{ id: 3, name: "Charlie", email: "charlie@work.com", role: "User" },
	{ id: 4, name: "David", email: "david@company.com", role: "Manager" },
]);

const { searchTerm, searchResults } = useGlobalSearch(data, [
	"name",
	"email",
	"role",
]);
</script>

<template>
  <div>
    <input 
      v-model="searchTerm"
      type="text" 
      placeholder="Search table..."
      class="w-full px-2 py-2 mb-4 border border-gray-300 rounded"
    />
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th class="border border-gray-300 px-2 py-2 text-left">ID</th>
          <th class="border border-gray-300 px-2 py-2 text-left">Name</th>
          <th class="border border-gray-300 px-2 py-2 text-left">Email</th>
          <th class="border border-gray-300 px-2 py-2 text-left">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in searchResults" :key="item.id">
          <td class="border border-gray-300 px-2 py-2">{{ item.id }}</td>
          <td class="border border-gray-300 px-2 py-2">{{ item.name }}</td>
          <td class="border border-gray-300 px-2 py-2">{{ item.email }}</td>
          <td class="border border-gray-300 px-2 py-2">{{ item.role }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
