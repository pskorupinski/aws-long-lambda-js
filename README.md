# AWS Long Lambda

## Purpose

Orchestrate the lambda job execution beyond the 15 minute timeout constraint.

This provides an alternative environment for executing time-consuming jobs, in case they are easily divisible into smaller chunks and not much of previous context is necessary to continue execution in the following step.

## Technologies

* Node.js
* AWS Lambda

## Requirements

### Node libraries

* See ``package.json``.

### Lambda configuration

Runtime:

* Node.js 18.x

Timeout:

* Recommended to set timeout to a maximum of 15 min 0 sec.

Environment variables:

* ``function_periodToAllowNextWorker``: An optimization parameter which allows to continue using the current lambda's execution for the next iteration without risking the timeout. In principle, it should be equal to the difference between the timeout value and the maximum duration that the worker may take - in milliseconds (it's good to test that beforehand).
* ``function_continueExecution``: A mechanism that allows to stop self-execution through an environmental variable. 0 -> stop. Any other value -> continue.
* ``function_workerParamAutoInitiate``: Defines whether the worker's input parameter should be automatically set based on ``function_workerParamInitialValueJson``. 0 -> no. Any other value -> yes.
* ``function_workerParamInitialValueJson``: The worker's input parameter's default value (depends on the parameter described above).

Policy:

* You need to allow the function to auto-execute itself. Find more information on that in [Recursive AWS Lambda Functions in Node.js JavaScript (tomgregory.com)](https://tomgregory.com/recursive-aws-lambda-functions-in-node-js-javascript/).

## Architecture

This simple orchestration layer will sequentially execute itself and allow your "worker" code do its job and return information that will be used as an input for the next "worker" - unless the "worker" realizes it is the last one in chain. You can parameterize it in a way that would ensure that a timeout does not happen - a "lethal" event for the chain of execution.

## Local configuration

See: [node-lambda](https://www.npmjs.com/package/node-lambda)

## Testing & deployment

See: [node-lambda](https://www.npmjs.com/package/node-lambda)
