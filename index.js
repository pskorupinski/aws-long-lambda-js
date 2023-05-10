import { doWork } from "./worker-sample.mjs";
import AWS from "aws-sdk";

const lambda = new AWS.Lambda();

let periodToAllowNextWorker;
let continueExecution;
let autoInitiate;
let workerParamInitialValue;

try {
    periodToAllowNextWorker = parseInt(process.env.function_periodToAllowNextWorker);
    continueExecution = parseInt(process.env.function_continueExecution);
    autoInitiate = parseInt(process.env.function_workerParamAutoInitiate);
    workerParamInitialValue = JSON.parse(process.env.function_workerParamInitialValueJson);
} catch (err) {
    console.error("Looks like the application is not correctly configured.", err);
    throw err;
}

// An option to initialize the worker param with an initial value in case it cannot be defined by the initiating entity

/**
 * The event parameter may contain a field "value" of a type object with the fields interpretable by the worker.
 * 
 * @param event
 * @returns 
 */
export const handler = async(event, context) => {

    if (continueExecution === 0) {
        console.warn("Stopping execution in accordance with the current environment configuration.")
        return false;
    }

    let workerParam = event.value;

    if (autoInitiate !== 0 && workerParam === undefined) {
        workerParam = workerParamInitialValue;
    }

    if (workerParam === workerParamInitialValue) {
        console.info("Starting the AWS Long Lambda.");
    }

    let allowedToContinue = true;
    let workerStartTime = new Date().getTime();
    let workerResponse;

    while (allowedToContinue === true) {
        workerResponse = await doWork(workerParam);

        if (workerResponse === false) {
            console.info("The AWS Long Lambda finished.")
            return workerResponse;
        }
        else {
            let currentTime = new Date().getTime();
            if ( (currentTime - workerStartTime) > periodToAllowNextWorker ) {
                allowedToContinue = false;
            }
            else {
                workerParam = workerResponse;
                console.info("Execution duration is " + (currentTime - workerStartTime) + ". Allowing the next worker.");
            }
        }
    }

    var params = {
        FunctionName: context.functionName,
        InvocationType: 'Event',
        Payload: JSON.stringify({ "value": workerResponse })
    };

    console.log("RESPONSE", workerResponse);

    // Just for testing
    return workerResponse;

    // See README.md about setting policy for self-execution
    return new Promise(function(resolve, reject) {
        lambda.invoke(params, function(err, data) {
            if (err) {
                console.log("WILL REJECT", err)
                reject(err)    
            } else {
                console.log("WILL RESOLVE", data)
                resolve(data)
            }
        })
    });

};