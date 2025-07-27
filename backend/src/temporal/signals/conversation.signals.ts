import * as wf from '@temporalio/workflow';


export const setConversationEnded = wf.defineSignal('setConversationEnded');

export const sendUserInput = wf.defineSignal<[string]>('sendUserInput');

export const confirmToolRun = wf.defineSignal<[boolean]>('confirmToolRun');

