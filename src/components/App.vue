<template>
    <ul>
        <li v-for="i in 5" :key="i">
            <el-button type="primary">{{ i }} this is a button</el-button>
        </li>
    </ul>
</template>