/* eslint-disable */
/**
* Auto generated file - DO NOT EDIT!
* # Helium Server Type Definitions
*
* @helium-methods getTasks, streamText
**/
import type { getTasks as __helium_method_0 } from '../server/tasks';
import type { streamText as __helium_method_1 } from '../server/streaming';

declare module 'heliumts/server' {
    // Method stubs for client-side type inference
    export const getTasks: import('heliumts/client').MethodStub<
        Parameters<typeof __helium_method_0['handler']>[0],
        Awaited<ReturnType<typeof __helium_method_0['handler']>>
    >;
    export const streamText: import('heliumts/client').MethodStub<
        Parameters<typeof __helium_method_1['handler']>[0],
        Awaited<ReturnType<typeof __helium_method_1['handler']>>
    >;
}
