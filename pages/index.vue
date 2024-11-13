<script setup lang="ts" >
import { useContentStore } from '~/stores/contentStore';
import { onMounted, ref, watch } from 'vue';

const contentStore = useContentStore();
const getContent = ref('');
const color = ref('green');
const currentWordIndex = ref(0); 
const charIndex = ref(0);  
const correctW = ref(0);
const splitted = ref<string[]>([]);
const wordStatuses = ref<Array<'correct' | 'incorrect' | null>>(new Array(splitted.value.length).fill(null));
const incorrectChar = ref(0);
const userInput = ref([''])


// Fetch content on mount
onMounted(async () => {
  await contentStore.textSnippet();
});

watch(() => contentStore.content,
  (newContent) => {
      splitted.value = newContent.split(" ");},
  { immediate: true }
);


watch(getContent, (newInput) => {
  checkWord(newInput);
});

watch(getContent, (content) =>{
  if(content){
    startTimer();}},
  {once:true}  // running timer only once  
)

const checkWord = (input: any) => {
  const currentWord = splitted.value[currentWordIndex.value] || '';
  if (input !== currentWord.slice(0, input.length)) {
    incorrectChar.value++;
    color.value = 'red';
    wordStatuses.value[currentWordIndex.value] = "incorrect";
    userInput.value.push(input);

  }else if(input === '' || currentWord.slice(0, input.length) === ''){
    color.value = 'black'

  }else{
    color.value = 'green';
    wordStatuses.value[currentWordIndex.value] = "correct";
  }

  if (input === currentWord) {
    getContent.value = '';  
    currentWordIndex.value++;  
    correctW.value++;
    userInput.value.push(input);
  }
};

const  getCorrectWord = (index : any) =>{
  return wordStatuses.value[index] === "correct" ? "green":
        wordStatuses.value[index] === "incorrect" ? "red" : "black";
}

// setTimer 

const currentTime = ref(30);
const targetTime = 0;

function startTimer(){
  const timer = setInterval(() =>{
    if(stopTyper(currentTime,targetTime,splitted,correctW)){
      clearInterval(timer);
    }else{
      currentTime.value--;
    }

}, 1000)
}


const pageStatus = ref('Active');
const stopTyper = (time: any, targetTime: number, words: any, correctWord: any) => {
  return time.value === targetTime || words.value.length === correctWord.value - 1;
};

const handleStopTyping = async() => {
  const joinInput = userInput.value.join("");
  contentStore.setResult(currentTime.value, incorrectChar.value, joinInput);
  contentStore.fetchResult();
  pageStatus.value = 'Inactive';
};

// Watcher to check if typing has stopped
watch(
  () => stopTyper(currentTime,targetTime,splitted,correctW),
  (hasStopped) => {
    if (hasStopped) {
      handleStopTyping();
    }
  }
);


const refreshWindow = () =>{
  window.location.reload();
}

</script>


<template>
  <nav class=" flex justify-center items-center text-center font-semibold text-3xl italic">

    <NuxtLink to="/">
      <img  class=" text-center w-48 pb-12 " src="../public/favicon.png" alt="">
    </NuxtLink> 
  </nav>
  <div class="grid grid-cols-4 gap-2  text-gray-8000 flex-wrap space-x-2">
    <!-- Score bar -->
    <div class="col-span-1 ml-12 bg-gray-100 w-48 h-36  rounded-xl shadow-xl shadow-purple-400">
      <div v-if="contentStore.accuracy || contentStore.speed">
        <div class="bold font-bold text-xl text-center pt-2">Score</div>
        <div class="border-b-4 w-2/3 pl-2"></div>
        <div class="pl-2 font-semibold">Accuracy: {{ contentStore.accuracy }}% </div>
        <div class="pl-2 pt-2 font-semibold">Speed: {{ contentStore.speed }} WPM </div>
        <div v-if="currentTime === 0">
          <div class="pl-2 px-3  font-semibold">Time: 30 </div>
        </div>
        <div v-else>
          <div class="pl-2 pt-2 font-semibold">Time: {{ targetTime }} </div>

        </div>
        
      </div>
      <div v-else>

        <div class="text-center pt-2">
          Start Typing ...
        </div>
        <div class="text-5xl text-center pt-6">
          {{ currentTime }}
        </div>
      </div>
    </div>
    
    <!-- Context Bar -->
    <div class=" shadow-xl text-balance col-span-3 block font-medium bg-gray-100 w-4/6 p-4  text-gray-800 overflow-hidden break-words
        rounded-xl mr-12 text-xl space-x-2">
      

      <span
       v-for="(word, index) in splitted" 
       :key="index"
       :style="{color: getCorrectWord(index)}"
       >
        {{ word }}
      </span>

    <div v-if="!contentStore.content" class="text-center">
        No content. Please  again later
      </div>
    </div>
   <div class=" text-gray-500 italic text-sm pl-24 ">
    Don't use spacing
   </div>
    
    <!-- Input Bar -->
    <div class="col-span-4 flex justify-center items-center py-12">
  <div class="flex items-center">
    <input
      v-show="contentStore.content"
      class="shadow-xl rounded-md p-4 text-xl font-semibold bg-white text-black"
      :disabled="currentTime === targetTime || splitted.length === correctW - 1"
      v-model="getContent"
      :style="{ color: color }"
      type="textarea"
      placeholder="Start typing..."
    />
    <div @click="refreshWindow" class="bg-purple-300 shadow-md hover:bg-purple-400 w-12 h-12 text-center rounded-2xl p-3 hover:cursor-pointer text-md ml-12 font-semibold">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </div>
  </div>
</div>

  </div>
</template>

