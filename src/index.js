
//Note to reviewer:
//Examples are provided in the form of self contained functions for each step

(function main() {

    function step1(){        
        const { getRandomWordSync } = require('word-maker');

        for(var i=1; i <= 100; i++){
            console.log('%d: %s', i, getRandomWordSync());
        }

    }


    function step2(){        
        const { getRandomWordSync } = require('word-maker');

        for(var i=1; i <= 100; i++){
            var word = '';

            //Check for multiples of 3
            if(i % 3 == 0)
            {
                word = 'Fizz'
            }
            
            //Check for multiples of 5
            if(i % 5 == 0)
            {
                word += 'Buzz'
            }
                    
            console.log('%d: %s', i, word === '' ? getRandomWordSync(): word);
        }
    };


    function step3(){        
        const { getRandomWord } = require('word-maker');

        //Array to hold promises resulting from each iteration
        var lines = [];

        for(var i=1; i <= 100; i++){
            var word = '';
            if(i % 3 == 0)
            {
                word='Fizz'
            }
            
            if(i % 5 == 0)
            {
                word += 'Buzz'
            }
            
            var index = Promise.resolve(i);
            var promise;
            if(word === ''){
                promise = Promise.all([index, getRandomWord()]);            
            }
            else{            
                promise = Promise.all([index, Promise.resolve(word)]);
            }

            //Collect promises to be monitored in order
            lines.push(promise.then((values) => {
                return { index: values[0], word: values[1] };
            }));
        }

        //Await all promises to complete before proceeding
        return Promise.all(lines).then((values) => {
            for(var i = 0; i < values.length; i++){
                //Spread and log values resolved from the promises array
                console.log('%d: %s', values[i].index, values[i].word);
            }
        });
    };


    function step4Sync(){        
        const { getRandomWordSync } = require('word-maker');

        for(var i=1; i <= 100; i++){
            var word = '';
            if(i % 3 == 0)
            {
                word='Fizz'
            }
            
            if(i % 5 == 0)
            {
                word += 'Buzz'
            }

            if(word === '')
            {
                //Try catch block: scope limited for managing only the
                //known exception scenario
                try {
                    //Emulates random exceptions (withErrors: true)
                    word = getRandomWordSync({ withErrors: true });
                }
                catch(e){
                    //Handle known exception
                    word = "It shouldn't break anything!";
                }
            }
                    
            console.log('%d: %s', i, word);
        }
    };


    function step4Async(){
        
        const { getRandomWord } = require('word-maker');

        var lines = [];
        for(var i=1; i <= 100; i++){
            var word = '';
            if(i % 3 == 0)
            {
                word='Fizz'
            }
            
            if(i % 5 == 0)
            {
                word += 'Buzz'
            }
            
            var index = Promise.resolve(i);
            var promise;
            if(word === ''){
                //Pass the index (current state) into the promise chain
                promise = Promise.all([index, getRandomWord({
                    withErrors: true
                }).catch(() => {
                    //Handles exceptions thrown inside the promise chain
                    return "It shouldn't break anything!";
                })]);
            }
            else{   
                //Promisify for consistency         
                promise = Promise.all([index, Promise.resolve(word)]);
            }

            lines.push(promise.then((values) => {
                return { index: values[0], word: values[1] };
            }));
        }

        return Promise.all(lines).then((values) => {
            for(var i = 0; i < values.length; i++){
                console.log('%d: %s', values[i].index, values[i].word);
            }
        });
    };


    function step5(){            
        const { getRandomWord } = require('word-maker');

        var lines = [];
        for(var i=1; i <= 100; i++){
            var word = '';
            if(i % 3 == 0)
            {
                word='Fizz'
            }
            
            if(i % 5 == 0)
            {
                word += 'Buzz'
            }
            
            var index = Promise.resolve(i);
            var promise;
            if(word === ''){
                //Emulates slowness (slow: true)
                promise = Promise.all([index, getRandomWord({
                    slow: true,
                    withErrors: true
                }).catch(() => {
                    return "It shouldn't break anything!";
                })]);
            }
            else{            
                promise = Promise.all([index, Promise.resolve(word)]);
            }

            lines.push(promise.then((values) => {
                return { index: values[0], word: values[1] };
            }));
        }

        return Promise.all(lines).then((values) => {
            const fs = require('fs');
            const path = require('path');
            var outputFile = path.resolve(__dirname, '..', 'output.txt');
            var stream = fs.createWriteStream(outputFile)
            
            //Promisify file io
            return new Promise((resolve, reject) => {
                stream.on('error', (e) => {
                    reject(e);
                });

                stream.on('finish', () => {
                    resolve();
                });

                try {
                    for(var i = 0; i < values.length; i++){
                        stream.write(`${values[i].index}: ${values[i].word}\n`);
                    }

                    console.log('Output written to %s', outputFile);
                }
                finally {
                    stream.end();
                }            
            });
        });
    };
    

    //Executes each step linearly
    console.log('Executing Step 1...');
    step1();
    console.log('Completed Step 1\n\n');

    console.log('Executing Step 2...');
    step2();
    console.log('Completed Step 2\n\n');

    console.log('Executing Step 3...');
    step3().then(() => {
        console.log('Completed Step 3\n\n');

        console.log('Executing Step 4 (Synchronously)...');
        step4Sync();

        console.log('\nExecuting Step 4 (Asynchronously)...');
        return step4Async();
    }).then(() => {
        console.log('Completed Step 4\n\n');
        
        console.log('Executing Step 5...');
        //Mark step5 execution start time
        var perfStart = process.hrtime();
        return Promise.all([Promise.resolve(perfStart), step5()])
    }).then((values) => {

        //Mark step5 execution end time
        var perfEnd = process.hrtime(values[0]);

        //Average execution time observed with slow = true: around 500ms
        console.log('Completed Step 5 in: %ds %dms', perfEnd[0], perfEnd[1] / 1000000);
    });
    
})();

