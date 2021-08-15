import { IBirthday } from "./IBirthday";
import { SPHttpClient } from "@microsoft/sp-http";

export interface IBirthdayUserListProps {
    people: IBirthday[]; 
    spHttpClient: SPHttpClient;   
}

export interface IBirthdayUserListState {
    //statusMessage:IMessage;
    showCallOut: boolean;
    calloutElement: number;
    person: IBirthday;
}
