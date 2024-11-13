import {defineStore} from 'pinia';

export const useContentStore = defineStore('useContents', {
    state:() =>({
        content: '',
        duration: 0,
        incorrectChar: 0,
        contentId: 1,
        totalItems: 0,
        // type result 
        accuracy: 0,
        userInput: "",
        speed: 0,

    }),
    actions:{
        setResult(time:number, incorrectChar: number, input:string){
            this.duration = time;
            this.incorrectChar = incorrectChar;
            this.userInput = input
            // console.log(input)
        },
        getRandom(max:number){
            this.contentId = Math.floor(Math.random() * (max - 1) + 1);
        },
        async textSnippet(){
            try{
                const total = await fetch('http://localhost:80/api/text_snippets?page=1')
                const totaldata = await total.json();
                this.getRandom(totaldata.totalItems);
                const response = await fetch(`http://localhost:80/api/text_snippets/${this.contentId}`) 

                if(!response.ok){ throw new Error('Failed to fetch content')}
                
                const data = await response.json();
                this.content = data.content;

            }catch(error){
                console.error("Error occured", error)
            }
        },
        async fetchResult(){
            try{
                const response = await fetch(`http://localhost:80/api/post-result`, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/ld+json',
                        'Content-Type': 'application/ld+json' 
                    },
                    body: JSON.stringify({
                        inputText: this.userInput,
                        duration: this.duration,
                        textSnippet: `api/text_snippets/${this.contentId}`,
                        incorrectChar: this.incorrectChar,
                    })
                })
                if(!response.ok){throw new Error("Faild to fetch results")}

                const data = await response.json();
                this.accuracy = data.accuracy;
                this.speed = data.wpm;

            }catch(error){
                console.error("Error occured: ", error )

            }
        }
    }
})

