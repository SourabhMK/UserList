import { IAnniversary } from "./IAnniversary";
import { SPHttpClient } from "@microsoft/sp-http";

export interface IAnniversaryUserListProps {
    people: IAnniversary[],
    spHttpClient: SPHttpClient;
}

export interface IAnniversaryUserListState {
    //statusMessage:IMessage;
    showCallOut: boolean;
    calloutElement: number;
    person: IAnniversary;
}