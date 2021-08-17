import { SPHttpClient } from "@microsoft/sp-http";
import { DisplayMode } from "@microsoft/sp-core-library";

export interface IMyRequestedIssuesProps {
  description: string;
  groupType:number;
   /**
   * Absolute URL of the current site
   */
    webUrl: string;
    /**
     * Instance of the SPHttpClient. Used to retrieve information about
     * people.
     */
    spHttpClient: SPHttpClient;

    loggedInUserName: string;
    loggedInUserEmail: string;
  issueDataList:IMyIssueList[];
  currentUserId:number;

}

export interface IMyIssueList {
  created:string,
  description:string,
  category:string,
  department:string,
  assignedTo:string,
  comment:string,
  status:string,
  attachments:string
}
