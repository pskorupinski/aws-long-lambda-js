// Develop your own worker based on this sample function

/**
 * Do any work that takes the maximum period of time aligned with the Lambda parametization (see README.md).
 * Needs to be able to figure out if it is the last one in the "doWork" chain.
 * Optionally, can pass any state or context that the next "doWork" will start from.
 * 
 * @param {*} workParameter Parameter returned by the previous doWork execution
 * @returns Parameter to pass to the next doWork execution or "false" if this was the last execution in chain.
 */
export async function doWork(workParameter) {
 
    return new Promise(async function (resolve, reject) {
        try {
            if (workParameter.int > 5) {
                resolve(false);
                return false;
            }

            await wait(2000);

            resolve({'int': workParameter.int+1});
        }
        catch(err) {
            console.error("Entire or partial error during doWork" + err);
            resolve({'int': workParameter.int});
        }
    });

}

function wait (ms) {
    return new Promise(resolve => setTimeout(() => resolve(true), ms));
}