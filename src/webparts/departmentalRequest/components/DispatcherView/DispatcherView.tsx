import * as React from 'react';
import styles from './DispatcherView.module.scss';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { IPersonaProps } from '@fluentui/react/lib/Persona';
import { IBasePickerSuggestionsProps, IPeoplePickerProps, NormalPeoplePicker, ValidationState } from '@fluentui/react/lib/Pickers';
//import { people, mru } from '@fluentui/example-data';
import DepartmentalRequest from '../DepartmentalRequest/DepartmentalRequest'
import { IDispatcherViewState } from './IDispatcherViewState';
import { IDispatcherViewProps } from './IDispatcherViewProps';
import { SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse } from '@microsoft/sp-http';
import {IDepartmentList, IDispacherList} from '../DepartmentalRequest/IDepartmentList'
import { DefaultButton, PrimaryButton, CompoundButton } from '@fluentui/react/lib/Button';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { IconButton } from '@fluentui/react/lib/Button';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
initializeIcons();
import { Icon } from '@fluentui/react/lib/Icon';
import { Dropdown, IDropdown, IDropdownOption, ktpTargetFromId } from 'office-ui-fabric-react';
import { Item } from '@pnp/sp/items';
import { result } from 'lodash';
import NoDataDispatcherView from '../NoDataDispatcherView/NoDataDispatcherView';
import DispatcherSelect from '../DispatcherSelect/DispatcherSelect';
import {fileElements} from './IDispatcherList'

// debugger;
export interface IExampleExtendedPersonaProps {
    imageUrl?: string;
    imageInitials?: string;
    text?: string;
    secondaryText?: string;
    tertiaryText?: string;
    optionalText?: string;
    presence?: number;
    isValid: boolean;
    canExpand?: boolean;
  }

  export interface IExtendedPersonaProps {
    text:string;
  }


export const people: (IPersonaProps)[] = [];

export var mru:(IPersonaProps)[]=[];

var grpName:string = 'IT Support';
var pickerGroupNames:(IPersonaProps)[]=[];

  export default class PeoplePickerTestExample extends React.Component<IDispatcherViewProps, IDispatcherViewState, {} > {

 
 constructor(props){
   super(props)
   this.state = {
    mostRecentlyUsed:[],
    peopleList:[],
    ticketCount:0,
    newPeoplePickerUser:'',
    loading:false,
    errorMessage:'',
    deptDetails:[],
    indexSelect:0,
    homeButton:0,
    idSelect:0,
    deptListDropDown:[],
    passAssignedToUser:{
      id:0,
      text:''
    },
    deleteSelectedTicket:'',
    dispatcherFileAddition:null,
    requesterFileCheck:0

   }
  }

  componentDidMount(){
    // this.loadDepartmentOptions();
    this.loadDeptListInfo();
      // this.testPart();
  }
//TODO: REMOVE THIS METHOD AFTER TSTING
  private loadDepartmentOptions():void{
    const headers: HeadersInit = new Headers();
    // suppress metadata to minimize the amount of data loaded from SharePoint
    headers.append("accept", "application/json;odata.metadata=none");
    this.props.spHttpClient
      .get(`${this.props.webUrl}/_api/web/sitegroups/GetByName('${grpName}')/Users?`,
      SPHttpClient.configurations.v1, {
        headers: headers
      })
      .then((res: SPHttpClientResponse): Promise<any> => {
        return res.json();
      })
      .then((res: any): void => {
        if (res.error) {
        //   // There was an error loading information about people.
        //   // Notify the user that loading data is finished and return the
        //   // error message that occurred
           this.setState({
             loading: false,
             errorMessage: res.error.message,
              });
          return;
        }
        if (res.value == 0) {
          // No results were found. Notify the user that loading data is finished
          this.setState({
            loading: false
          });
          return;
        }

        pickerGroupNames = res.value.map((r,index)=>{
          return{
            text:r.Title,
            id:r.Id
          }
        })
  
    if(pickerGroupNames.length>0){
    this.setState({
      loading:false,
    })
    }
  }, (error: any): void => {
    // An error has occurred while loading the data. Notify the user
    // that loading data is finished and return the error message.
    this.setState({
      loading: false,
      errorMessage: error
    });
  })
  .catch((error: any): void => {
    // An exception has occurred while loading the data. Notify the user
    // that loading data is finished and return the exception.
    this.setState({
      loading: false,
      errorMessage: error
    });
  });
   }

   private loadDepartmentOptionsByGroupName(groupName):Promise<IDropdownOption[]>{
    const headers: HeadersInit = new Headers();
    headers.append("accept", "application/json;odata.metadata=none");
    return this.props.spHttpClient
      .get(`${this.props.webUrl}/_api/web/sitegroups/GetByName('${groupName}')/Users?`,
      SPHttpClient.configurations.v1, {
        headers: headers
      })
      .then((res: SPHttpClientResponse): Promise<any> => {
        return res.json();
      })
      .then((res: any) => {
        var groupUser:IDropdownOption[]=res.value.map((r,index)=>{
          return{
            text:r.Title,
            id:r.Id
          }
        })
      return Promise.resolve(groupUser);
  }) 
  
  //  return pickerGroupNames;
   }


   private loadDeptListInfo():void{
    const headers: HeadersInit = new Headers();
    // suppress metadata to minimize the amount of data loaded from SharePoint
    headers.append("accept", "application/json;odata.metadata=none");
    this.props.spHttpClient
      .get(`${this.props.webUrl}/_api/web/lists/getbytitle('EmployeeRequest')/items?$select=*,Author/Title,AttachmentFiles&$expand=Author,AttachmentFiles &$filter=Department eq '${this.props.passGroupName}' and Status eq 'Pending' &$orderby=ID desc`,
      SPHttpClient.configurations.v1, {
        headers: headers
      })
      .then((res: SPHttpClientResponse): Promise<any> => {
        return res.json();
      })
      .then((res: any): void => {
        if (res.error) {
           this.setState({
             loading: false,
             errorMessage: res.error.message,
              });
          return;
        }
        if (res.value == 0) {

          this.setState({
            loading: false
          });
          return;
        }
        let createdDateFormat = new Date('').toLocaleDateString();
        this.setState({
          ticketCount:res.value.length,
          deptDetails:res.value.map((r,index)=>{
            return{
              ticketNumber:`INC_${r.Department}_000${r.ID}`,
              supportDeptName:r.DepartmentGroup,
              raisedBy:r.Author.Title,
              issueDate:r.Created,
              description:r.Description,
              category:r.Category,
              department:r.Department,
              status:r.Status,
              dispatcherDeptName:r.AssignedTo,
              reAssignedTo:r.ReAssignTo,
              dataId:r.ID,
              // attachmentFileName:r.AttachmentFiles.length?r.AttachmentFiles:null,
              attachmentFileName:r.AttachmentFiles.map((r,i)=>{
                return{
                FileName:r.FileName,
                ServerRelativeUrl:r.ServerRelativeUrl
                }
              }),
              getAttachmentData:r.AttachmentFiles.length?r.AttachmentFiles[0].ServerRelativeUrl:'',
              requesterAttachmentCheck:r.AttachmentFiles.length
            }
          }) 
        })
        console.log("deptDetail = " + this.state.deptDetails[0].supportDeptName);
  
    if(this.state.deptDetails.length>0){
    this.setState({
      loading:false,
    });
    }
  }, (error: any): void => {
    this.setState({
      loading: false,
      errorMessage: error
    });
  })
  .catch((error: any): void => {
    this.setState({
      loading: false,
      errorMessage: error
    });
  });
   }

   private loadNewGrpName(val,indexId){
     grpName = val;
     console.log("grpName = " +  val);
     console.log("index = " +  indexId);
     this.setState({
      //  loadPeoplePicker: 1,
       idSelect:indexId

      //  homeButton:1
     })
     this.loadDepartmentOptions();
    console.log("object = " + this.state.deptDetails[indexId].reAssignedTo);
   }


   addMultipleAttachmentLoop(result){
    let promiseUploadAllRequesterAttachments = [];
    let file = this.state.dispatcherFileAddition;
      for(let i=0;i<file.length;++i){
        promiseUploadAllRequesterAttachments.push(this.addAttachementInList(result,file[i]));
      }
  }


  addAttachementInList(result,eachFile){
    const headers: HeadersInit = new Headers();
    // suppress metadata to minimize the amount of data loaded from SharePoint
    headers.append("accept", "application/json;odata.metadata=none");
    this.props.spHttpClient
      .get(`${this.props.webUrl}/_api/web/lists/GetByTitle('EmployeeRequest')/Id`,
      SPHttpClient.configurations.v1, {
        headers: headers
      })
      .then((res: SPHttpClientResponse): Promise<any> => {
        return res.json();
      })
      .then((res: any): void => {
        if (res.error) {
           this.setState({
             errorMessage: res.error.message,
              });
          return;
        }
        else{
         var Guid = res.value;
          console.log('res = ' + res);
          let ID = result;
          console.log('');
          // let file = (document.querySelector("#FileAttachment") as HTMLInputElement).files[0];   
          // let file = this.state.dispatcherFileAddition;     
              if (eachFile) { 
                  let fileName = `DISP_${eachFile.name}`;
                  let spOpts : ISPHttpClientOptions  = {
                    headers: {
                      "Accept": "application/json",
                      "Content-Type": "application/json"
                    },
                    body: eachFile       
                  };
                  // var url = `${this.props.webUrl}/_api/web/lists('${Guid}')/items('${ID}')/AttachmentFiles/add('${file.name}')`;
                  var url = this.props.webUrl + `/_api/web/lists(guid'` + Guid + `')/items` + `('` + ID + `')` + `/AttachmentFiles/add(FileName='` + fileName +`')`;
                  // var url = `${this.props.webUrl}/_api/${oData}/AttachmentFiles/add('${file.name}')`;
                  this.props.spHttpClient.post(url, SPHttpClient.configurations.v1, spOpts).then((response: SPHttpClientResponse) => {
                    console.log(`Status code: ${response.status}`);
                    console.log(`Status text: ${response.statusText}`);
                    if(Number(`${response.status}`) >300)
                    {
                      alert('Error Uploading file, Try again or contact IT');
                      // this._closeDialog();
                      return;
                    }
                    response.json().then((responseJSON: JSON) => {
                      console.log(responseJSON);        
                      this.setState({
                        indexSelect: result
                      })         
                    });
                  });            
              }
        }
  }, (error: any): void => {
    this.setState({
      errorMessage: error
    });
  })
  .catch((error: any): void => {
    this.setState({
      errorMessage: error
    });
    });      
  }

   onSubmitDropDownHandle(newPeoplePicker:any,idRequest:number,assignedToUser,ticketNumberCheck){
  //  await this.setState({
  //     newPeoplePickerUser: newPeoplePicker[0].text
  //     //loadPeoplePicker:0
  //       },()=> this.addReAssignedToData(this.state.newPeoplePickerUser,idRequest))
        if(this.state.deleteSelectedTicket === ticketNumberCheck){
        // this.addAttachementInList(idRequest);
        this.addMultipleAttachmentLoop(idRequest);
        this.addReAssignedToData(assignedToUser,idRequest);
        }
  }

  addReAssignedToData(newReAssignedToUser:any,idRequest:number){
      console.log("newReAssignedToUser = " + newReAssignedToUser + idRequest);
      console.log("newReAssignedToUser = " + newReAssignedToUser);

      const headers: HeadersInit = new Headers();
      // suppress metadata to minimize the amount of data loaded from SharePoint
      headers.append("accept", "application/json;odata.metadata=none");
      this.props.spHttpClient
        .get(`${this.props.webUrl}/_api/web/lists/getbytitle('EmployeeRequest')/items('${idRequest}')?$select=*,ReAssignTo/Id&$expand=ReAssignTo`,
        SPHttpClient.configurations.v1, {
          headers: headers
        })
        .then((res: SPHttpClientResponse): Promise<any> => {
          return res.json();
        })
        .then((res: any): void => {
          if (res.error) {
             this.setState({
               loading: false,
               errorMessage: res.error.message,
                });
            return;
          }
          if (res.value == 0) {
            // No results were found. Notify the user that loading data is finished
            this.setState({
              loading: false
            });
            return;
          }

          var metaTest ={
            // __metadata: { 'type': 'SP.Data.EmployeeRequestListItem' },
            'ReAssignToId': newReAssignedToUser.id
          }
          const spOpts: string = JSON.stringify({
            // metaTest
            // __metadata: { 'type': 'SP.Data.EmployeeRequestListItem' },
            'Status': "In Process",
            'ReAssignToId': newReAssignedToUser.id
                // 'Comment': 'Comment is working'
                // OnOffBoardTask:1
          })
      
          this.props.spHttpClient.post(`${this.props.webUrl}/_api/web/lists/GetByTitle('EmployeeRequest')/items(${res.Id})`, SPHttpClient.configurations.v1, 
          {
            // __metadata: { 'type': 'SP.Data.EmployeeRequestListItem' },
            headers: {  
              'Accept': 'application/json;odata=nometadata',  
              'Content-type': 'application/json;odata=nometadata',  
              'odata-version': '',  
              'IF-MATCH': '*',  
              'X-HTTP-Method': 'MERGE',
              // "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },  
            // body:spOpts
            body:spOpts
          })
              .then((response: SPHttpClientResponse) => {
                // Access properties of the response object. 
                console.log(`Status code: ${response.status}`);
                console.log(`Status text: ${response.statusText}`);
                
                //response.json() returns a promise so you get access to the json in the resolve callback.

              })
                .then((responseJSON: any) => {
                  var items = this.state.deptDetails.filter(item=> item.dataId !==idRequest);
                  this.setState({
                    deptDetails:items,
                    deptListDropDown:[],
                    ticketCount: this.state.ticketCount - 1,
                    passAssignedToUser:{
                      id:null,
                      text:''
                    }

                  })
                });


    }, (error: any): void => {
      // An error has occurred while loading the data. Notify the user
      // that loading data is finished and return the error message.
      this.setState({
        loading: false,
        errorMessage: error
      });
    })
    .catch((error: any): void => {
      // An exception has occurred while loading the data. Notify the user
      // that loading data is finished and return the exception.
      this.setState({
        loading: false,
        errorMessage: error
      });
      });
  }


  getUserByDept(control,reAssignTo,department,idNumber){
    grpName= department;
    // this.loadDepartmentOptions();
    this.loadDepartmentOptionsByGroupName(department)
    .then(
      data=>{
          console.log(data);
          this.setState({
            deptListDropDown:data,
            idSelect:idNumber
          },()=>console.log(this.state.deptListDropDown[0].id))
      }
    )
  
  }

  homeButtonClick(){
    this.setState({
      homeButton:1,
    })
  }

  onUserSelect(userName,selectedName, ticketNumber){
    this.setState({
      passAssignedToUser:selectedName,
      deleteSelectedTicket:ticketNumber
    },()=> console.log(this.state.passAssignedToUser.id))
    console.log(userName,selectedName);
  }

//   onInputFileClickHandle(ticketNumber){
//     // textInput.current.focus();
//   this.setState({
//     indexSelect:ticketNumber,
//     commonFile:null
//   })
// }

  onDispatcherFileAddition = (dispatcherFileAdd) => {
    let allFiles = [];
    for(let i=0;i<dispatcherFileAdd.length;++i){
      allFiles.push(dispatcherFileAdd[i]);
  }
  this.setState({
        dispatcherFileAddition: allFiles
      })
  }

  public render(): React.ReactElement<IDispatcherViewProps> {
  return (
    <div className={styles.dispatcherView}>
  
      {(this.state.homeButton === 0) && (this.state.ticketCount > 0) &&
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-lg12">
             <Icon iconName='NavigateBack' style={{fontSize:'25px', cursor:'pointer'}} onClick={()=>this.homeButtonClick()} ></Icon>
          </div>
        </div>
      {/* {(this.state.deptDetails.length > 0) && */}
      <div className="ms-Grid-row">
      <div className="ms-Grid-col ms-lg12 ms-sm12">
      <div style={{overflowX:'auto'}}>
      <table className={styles.tableSet} >
          <thead>
            <tr>
              <th>Ticket Number</th>
              <th>Raised By</th>
              <th>Issue Date</th>
              <th>Description</th>
              <th>Assign To</th>
              <th>Attachment from Requester</th>
              <th>Attachment from Dispatcher</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {
             this.state.deptDetails.map((res,index)=>{
             var issuedDate = new Date(res.issueDate).toLocaleDateString();
                return(
                  <tr>
                    <td>{res.ticketNumber}</td>
                    <td>{res.raisedBy}</td>
                    <td>{issuedDate}</td>
                    <td>{res.description}</td>
                    <td>
                      <Dropdown
                       id={res.ticketNumber + '_dropDown'} 
                       placeholder='Select option'
                       defaultSelectedKey={" "}
                      onClick={(e)=>this.getUserByDept(res.ticketNumber + '_dropDown',res.reAssignedTo,res.supportDeptName,res.dataId)} 
                      options={this.state.deptListDropDown}
                      onChange={(e,selectedName)=>this.onUserSelect(e,selectedName,res.ticketNumber)}>
                      </Dropdown>
                    </td>
                    <td key={index}>
                      {
                      res.attachmentFileName.map((r,i)=>{
                        return(
                          <a href={r.ServerRelativeUrl}> {`${r.FileName}\n`}</a>
                        )
                      })
                      }
                    </td>
                    <td>
                       <input multiple type="file" style={{border:'1px solid #ddd',paddingTop:'10px', paddingBottom:'10px' }}
                        // defaultValue=''
                      // onClick={()=>this.onInputFileClickHandle(res.dataId)}
                        // value={'Something'}
                        // value={(this.state.indexSelect === res.dataId)?'Something ':'nothing'}
                        // onChange={(e)=> this.onDispatcherFileAddition(e.target.files) }
                        key={this.state.indexSelect}
                        onChange={(e)=>this.onDispatcherFileAddition(e.target.files)}
                       />
                    </td>
                    <td>
                    <Icon iconName="Save" style={{fontSize:'20px', cursor:'pointer'}} onClick={(e)=>this.onSubmitDropDownHandle(e,res.dataId,this.state.passAssignedToUser,res.ticketNumber)}></Icon>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
          </table>
         </div>
        </div>
      </div> 
    </div>
  }
  {
    (this.state.ticketCount <= 0) && (this.state.homeButton === 0) &&
    <div className="ms-Grid">
       <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-lg12">
             <Icon iconName='NavigateBack' style={{fontSize:'25px', cursor:'pointer'}} onClick={()=>this.homeButtonClick()} ></Icon>
          </div>
        </div>
    <div className="ms-Grid-row">
      <div className="ms-Grid-col ms-lg12">
        <h2>No ticket to be dispatched</h2>
      </div>
    </div>  
  </div>
  }

  {(this.state.homeButton === 1) &&
              <DispatcherSelect msGraphClientFactory={this.props.msGraphClientFactory} currentUserId={this.props.currentUserId} loggedInUserEmail={this.props.loggedInUserEmail} loggedInUserName={this.props.loggedInUserName} spHttpClient={this.props.spHttpClient} webUrl={this.props.webUrl} emailType={this.props.emailType} description={this.props.description} />
  }
    </div>
  );
}
}

