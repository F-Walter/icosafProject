<<<<<<< HEAD
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProblemModalComponent } from '../UCDetails/modal/problem-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { ProblemImageComponent, Slide } from './error-image-modal/problem-image.component';
import { SseService } from 'src/app/services/SseService/sse-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { UCCService } from 'src/app/services/UC-C/uc-c-service.service';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { Order } from 'src/app/model/order.model';
import { MatSort } from '@angular/material/sort';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Task } from 'src/app/model/task.model';


const options = { hour: "numeric", minute: "numeric", second: "numeric" }
export interface Problem {
  state: number; // 0 nessun problema or problema risolto // 1 problema // 2 componente non ancora considerato //3 loading
  id: string;
  kit: string;
  hour: string;
  problemsFound: string;
  description: string;
  button: string;
}


interface Prelievo {
  state: number;
  components: string
  kit: string;
  hour: string;
  delay: number;
}


@Component({
  selector: 'app-agv-details',
  templateUrl: './agv-details.component.html',
  styleUrls: ['./agv-details.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class AgvDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('problemPanel', { static: false }) problemPanel: MatExpansionPanel

  sseSub: Subscription

  @ViewChild('matSortProblems') matSortProblems: MatSort;
  @ViewChild('matSortPrelievi') matSortPrelievi: MatSort;


  @ViewChild("OperatorSelection") opSelection: MatRadioGroup
  @ViewChild("AGVActionSelected") AGVsel: MatRadioGroup
  dataSourceProblems: MatTableDataSource<Problem>
  displayedColumnsProblems = ['state', 'id', 'kit', 'problemsFound', 'button', 'hour'];
  expandedElement: Problem | null;
  isHidingProblemHandling: boolean
  AGVActionSelected: string
  OpActionSelected: string
  opChecked: boolean = false

  agvOptions = ['Ritentare', 'Rimanere fermo', 'Continuo attività']
  opOptions = [{ text: 'Richiesta intervento', val: false, dis: false }, { text: 'Richiesta interveno urgente', val: false, dis: false }]

  displayedColumnsPrelievi: string[] = ['state', 'components', 'kit', 'hour', 'delay'];
  dataSourcePrelievi: MatTableDataSource<Prelievo>
  problems: Slide[];
  taskErrorId: Number;
  queryParamsSub: Subscription;
  useCase: string;
  selectedAgv: string;


  AGVActionSelection(actionSelected: string) {
    this.AGVActionSelected = actionSelected

    if (actionSelected === this.agvOptions[1]) {
      console.log("selezionato rimanere fermo")
      if (!this.opOptions.find(o => o.val == true))
        this.opOptions[0].val = true
      for (let op of this.opOptions) {
        op.dis = false
      }
      console.log("Changed now")
    }
    else {
      console.log("selezionato altro")
      for (let op of this.opOptions) {
        op.val = false
        op.dis = true
      }
    }
  }
  OpActionSelection(opSel) {
    if (!opSel.dis) {
      for (let op of this.opOptions)
        if (opSel != op) op.val = false
      //this.opOptions.find(o=>o!=opSel).val = false
      this.opOptions.find(o => o == opSel).val = true
    }
  }

  private _paginatorPrelievi: MatPaginator;
  paramsSub: Subscription;
  public get paginatorPrelievi(): MatPaginator {
    return this._paginatorPrelievi;
  }
  @ViewChild('paginatorPrelievi')
  public set paginatorPrelievi(value: MatPaginator) {
    this._paginatorPrelievi = value;
    this.dataSourcePrelievi.paginator = this.paginatorPrelievi

  }
  private _paginatorErrors: MatPaginator;
  public get paginatorErrors(): MatPaginator {
    return this._paginatorErrors;
  }
  @ViewChild('paginatorErrors')
  public set paginatorErrors(value: MatPaginator) {
    this._paginatorErrors = value;
    this.dataSourceProblems.paginator = this.paginatorErrors
  }


  constructor(
    public dialog: MatDialog,
    public imageDialog: MatDialog,
    private sseService: SseService,
    private UCCService: UCCService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

    this.isHidingProblemHandling = true
    this.problems = []
    this.problems.push({ image: "../../../assets/img/errorIcon.svg" },
      { image: "../../../assets/img/dangerIcon.svg" },
      { image: "../../../assets/img/settingIconSelected.svg" })


    this.dataSourcePrelievi = new MatTableDataSource()
    this.dataSourceProblems = new MatTableDataSource()
  }
  ngAfterViewInit(): void {
    this.paginatorPrelievi = this.dataSourcePrelievi.paginator
    this.paginatorErrors = this.dataSourceProblems.paginator
    this.matSortProblems = this.dataSourcePrelievi.sort
    this.matSortPrelievi = this.dataSourcePrelievi.sort
  }

  ngOnInit(): void {

    //TODO chiamata per ottenere tutti i problemi e i task risolti fino a quel momento
    this.paramsSub = this.activatedRoute.params.subscribe(params => {

      if (params['workAreaId'] && params['agvId'] && this.activatedRoute.parent.snapshot.params["useCase"]) {
        this.useCase = this.activatedRoute.parent.snapshot.params["useCase"] 
        this.selectedAgv = params['agvId']

        this.UCCService.subjectSelectedWorkAreaAndAgv.next([Number(params['workAreaId']), Number(params['agvId'])])
console.log("parametri",this.UCCService.currentOrder.order_id, params['agvId']);

        this.UCCService.getTaskListAgv(this.UCCService.currentOrder.order_id, Number(params['agvId'])).subscribe(tasks => {

          console.log(tasks);
          
          let sourceProblems: Problem[] = []
          let sourcePrelievi: Prelievo[] = []
          //TODO: definire come dare settare le due data source problemi e prelievi
          tasks.forEach((t: Task) => {
            let task = new Task(t.task_id, t.task_descr, t.mach_det_id, t.order_id, t.start_time, t.stop_time, t.task_status_id, t.task_comment, t.agv_id, t.oper_id, t.error_time, t.component_id, t.task_type_id, t.task_ref, t.create_time)
            switch (task.task_status_id) {
              //created
              case 1:
                //  sourcePrelievi.push({
                //   state: 1,
                //   components: `PN${task.task_id}`,
                //   kit: "45",
                // //  hour: task.startTime.toLocaleTimeString('it', options)
                // hour: new Date().toLocaleTimeString('it', options)
                // })
                break;
              //completed
              case 2:
                sourcePrelievi.push({
                  state: task.error_time ? 4 : 2,
                  components: `PN${task.task_id}`,
                  kit: "45",
                  //   hour: task.stop_time.toLocaleTimeString('it', options)
                  hour: new Date().toLocaleTimeString('it', options),
                  delay: task.computeDelayInMilliseconds() / 1000
                })

                break;
              //failed
              case 3:
              //pending
              case 4:
                this.taskErrorId = task.task_id
                sourceProblems.push({
                  state: 3,
                  id: `PN${task.task_id}`,
                  kit: '45',
                  //hour: task.error_time.toLocaleTimeString('it', options),
                  hour: new Date().toLocaleTimeString('it', options),
                  problemsFound: 'Tipologia Problema',
                  button: '',
                  description: `Problem description`,
                })
                break;
            }

            sourcePrelievi = sourcePrelievi.sort((a, b) => b.hour.localeCompare(a.hour))
            this.dataSourcePrelievi.data = sourcePrelievi

            this.dataSourceProblems.data = sourceProblems

            this.dataSourcePrelievi.paginator = this.paginatorPrelievi
            this.dataSourcePrelievi.sort = this.matSortPrelievi
            this.dataSourceProblems.paginator = this.paginatorErrors
            this.dataSourceProblems.sort = this.matSortProblems
          })
        })

        if (!this.sseSub) {
          console.log("Mi iscrivo");


          this.sseSub = this.sseService
            .getServerSentEvent("http://localhost:4200/API/events")
            .subscribe(data => {

              //console.log("D.d ",data.data);


              let response = JSON.parse(data.data)

              let uc:string = response.uc;

              console.log(uc, this.useCase, response.agv_id, response.agv_id, this.selectedAgv)

              if (uc === this.useCase && response.agv_id !== null && response.agv_id === Number(this.selectedAgv)) {

                if (response.status === "OK") {

                  let taskId = response.task_id

                  let problemFound = false

                  let sourceProblem = this.dataSourceProblems.data.filter(problem => { problemFound = true; return problem.id !== `PN${taskId}` })

                  this.dataSourceProblems.data = sourceProblem

                  let sourcePrelievi = [...this.dataSourcePrelievi.data, {
                    state: problemFound ? 4 : 2,
                    components: `PN${taskId}`,
                    kit: "45",
                    hour: new Date().toLocaleTimeString('it', options),
                    delay: response.delay
                  }]
                  sourcePrelievi = sourcePrelievi.sort((a, b) => b.hour.localeCompare(a.hour))

                  this.dataSourcePrelievi.data = sourcePrelievi

                  this.dataSourcePrelievi.paginator = this.paginatorPrelievi
                  this.dataSourcePrelievi.sort = this.matSortPrelievi

                } else {
                  if (response.status === "NOK") {

                    let taskId = response.task_id
                    this.dataSourceProblems.data = [
                      {
                        state: 3,
                        id: `PN${response.task_id}`,
                        kit: 'Nome kit',
                        hour: new Date().toLocaleTimeString('it', options),
                        problemsFound: 'Tipologia Problema',
                        button: '',
                        description: `Problem description`,
                      }
                    ]

                    this.dataSourceProblems.paginator = this.paginatorErrors
                    this.dataSourceProblems.sort = this.matSortProblems
                  }
                }
              }
            })
        }
      }
    })

    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams['openError']) {
        //Se c'è errore allora lo dobbiamo far vedere
        this.problemPanel.open()
        this.expandedElement = this.dataSourceProblems.data.find(problem => problem.id === `PN${queryParams['openError']}`)
        this.taskErrorId = Number(queryParams['openError'])
        this.isHidingProblemHandling = false
      }
    })
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe()
    this.queryParamsSub.unsubscribe()
    this.sseSub.unsubscribe()
    this.sseSub = null
  }


  headerOfColumn(column: string) {
    switch (column) {
      case 'state':
        return 'Stato';
      case 'id':
        return 'Componente';
      case 'hour':
        return 'Ora';
      case 'problemsFound':
        return 'Problemi Rilevati';
      default:
        break;
    }
  }

  proceed() {
    this.UCCService.getLastActionError(15).subscribe(success => {
      console.log(success[0].error_id);

      //TODO: se la pagina viene aggiornata quando spunta la notifica, queste informazioni non sono presenti
      // e non si sa chi è taskErrorId
      this.UCCService.setSolveAction(this.AGVActionSelected, 1, 1, 1, success[0].error_id).subscribe(response => {
        this.UCCService.setTaskStatusOk(Number(this.taskErrorId)).subscribe(_ => {
          console.log("Risolvi ora", response)
          this.taskErrorId = null
          this.ngOnInit()
        })
      })
    })
  }

  solve(element: Problem) {
    event.stopPropagation();
    //this.dialog.open(ProblemModalComponent);
    this.isHidingProblemHandling = false
    this.expandedElement = element
  }

  openImage(imageSrc: Slide) {
    console.log(imageSrc)
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = "50%"
    dialogConfig.minHeight = "50%"
    dialogConfig.panelClass = "zeroPaddingModal"


    let imageArray = []

    imageArray.push(imageSrc)

    this.problems.forEach(element => {
      if (element.image != imageSrc.image)
        imageArray.push(element)
    });

    dialogConfig.data = {
      images: imageArray
    };
    this.imageDialog.open(ProblemImageComponent, dialogConfig)
  }
}

// const PROBLEMS: Item[] = [
//   {
//     state: 2,
//     id: 'PN 45335478',
//     kit: 'Nome kit',
//     hour: '10:59',
//     problemsFound: 'Tipologia Problema',
//     button: '',
//     description: `Problem description`
//   },
// ]


=======
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProblemModalComponent } from '../UCDetails/modal/problem-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { ProblemImageComponent, Slide } from './error-image-modal/problem-image.component';
import { SseService } from 'src/app/services/SseService/sse-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { UCCService } from 'src/app/services/UC-C/uc-c-service.service';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { Order } from 'src/app/model/order.model';
import { MatSort } from '@angular/material/sort';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Task } from 'src/app/model/task.model';


const options = { hour: "numeric", minute: "numeric", second: "numeric" }
export interface Problem {
  state: number; // 0 nessun problema or problema risolto // 1 problema // 2 componente non ancora considerato //3 loading
  id: string;
  kit: string;
  hour: string;
  problemsFound: string;
  description: string;
  button: string;
}


interface Prelievo {
  state: number;
  components: string
  kit: string;
  hour: string;
  delay: number;
}


@Component({
  selector: 'app-agv-details',
  templateUrl: './agv-details.component.html',
  styleUrls: ['./agv-details.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class AgvDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('problemPanel', { static: false }) problemPanel: MatExpansionPanel

  sseSub: Subscription

  @ViewChild('matSortProblems') matSortProblems: MatSort;
  @ViewChild('matSortPrelievi') matSortPrelievi: MatSort;


  @ViewChild("OperatorSelection") opSelection: MatRadioGroup
  @ViewChild("AGVActionSelected") AGVsel: MatRadioGroup
  dataSourceProblems: MatTableDataSource<Problem>
  displayedColumnsProblems = ['state', 'id', 'kit', 'problemsFound', 'button', 'hour'];
  expandedElement: Problem | null;
  isHidingProblemHandling: boolean
  AGVActionSelected: string
  OpActionSelected: string
  opChecked: boolean = false

  agvOptions = ['Ritentare', 'Rimanere fermo', 'Continuo attività']
  opOptions = [{ text: 'Richiesta intervento', val: false, dis: false }, { text: 'Richiesta interveno urgente', val: false, dis: false }]

  displayedColumnsPrelievi: string[] = ['state', 'components', 'kit', 'hour', 'delay'];
  dataSourcePrelievi: MatTableDataSource<Prelievo>
  problems: Slide[];
  taskErrorId: Number;
  queryParamsSub: Subscription;
  useCase: string;
  selectedAgv: string;


  AGVActionSelection(actionSelected: string) {
    this.AGVActionSelected = actionSelected

    if (actionSelected === this.agvOptions[1]) {
      console.log("selezionato rimanere fermo")
      if (!this.opOptions.find(o => o.val == true))
        this.opOptions[0].val = true
      for (let op of this.opOptions) {
        op.dis = false
      }
      console.log("Changed now")
    }
    else {
      console.log("selezionato altro")
      for (let op of this.opOptions) {
        op.val = false
        op.dis = true
      }
    }
  }
  OpActionSelection(opSel) {
    if (!opSel.dis) {
      for (let op of this.opOptions)
        if (opSel != op) op.val = false
      //this.opOptions.find(o=>o!=opSel).val = false
      this.opOptions.find(o => o == opSel).val = true
    }
  }

  private _paginatorPrelievi: MatPaginator;
  paramsSub: Subscription;
  public get paginatorPrelievi(): MatPaginator {
    return this._paginatorPrelievi;
  }
  @ViewChild('paginatorPrelievi')
  public set paginatorPrelievi(value: MatPaginator) {
    this._paginatorPrelievi = value;
    this.dataSourcePrelievi.paginator = this.paginatorPrelievi

  }
  private _paginatorErrors: MatPaginator;
  public get paginatorErrors(): MatPaginator {
    return this._paginatorErrors;
  }
  @ViewChild('paginatorErrors')
  public set paginatorErrors(value: MatPaginator) {
    this._paginatorErrors = value;
    this.dataSourceProblems.paginator = this.paginatorErrors
  }


  constructor(
    public dialog: MatDialog,
    public imageDialog: MatDialog,
    private sseService: SseService,
    private UCCService: UCCService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

    this.isHidingProblemHandling = true
    this.problems = []
    this.problems.push({ image: "../../../assets/img/errorIcon.svg" },
      { image: "../../../assets/img/dangerIcon.svg" },
      { image: "../../../assets/img/settingIconSelected.svg" })


    this.dataSourcePrelievi = new MatTableDataSource()
    this.dataSourceProblems = new MatTableDataSource()
  }
  ngAfterViewInit(): void {
    this.paginatorPrelievi = this.dataSourcePrelievi.paginator
    this.paginatorErrors = this.dataSourceProblems.paginator
    this.matSortProblems = this.dataSourcePrelievi.sort
    this.matSortPrelievi = this.dataSourcePrelievi.sort
  }

  ngOnInit(): void {

    //TODO chiamata per ottenere tutti i problemi e i task risolti fino a quel momento
    this.paramsSub = this.activatedRoute.params.subscribe(params => {

      if (params['workAreaId'] && params['agvId'] && this.activatedRoute.parent.snapshot.params["useCase"]) {
        this.useCase = this.activatedRoute.parent.snapshot.params["useCase"] 
        this.selectedAgv = params['agvId']

        this.UCCService.subjectSelectedWorkAreaAndAgv.next([params['workAreaId'], Number(params['agvId'])])
console.log("parametri",this.UCCService.currentOrder.order_id, params['agvId']);

        this.UCCService.getTaskListAgv(this.UCCService.currentOrder.order_id, Number(params['agvId'])).subscribe(tasks => {

          console.log(tasks);
          
          let sourceProblems: Problem[] = []
          let sourcePrelievi: Prelievo[] = []
          //TODO: definire come dare settare le due data source problemi e prelievi
          tasks.forEach((t: Task) => {
            let task = new Task(t.task_id, t.task_descr, t.mach_det_id, t.order_id, t.start_time, t.stop_time, t.task_status_id, t.task_comment, t.agv_id, t.oper_id, t.error_time, t.component_id, t.task_type_id, t.task_ref, t.create_time)
            switch (task.task_status_id) {
              //created
              case 1:
                //  sourcePrelievi.push({
                //   state: 1,
                //   components: `PN${task.task_id}`,
                //   kit: "45",
                // //  hour: task.startTime.toLocaleTimeString('it', options)
                // hour: new Date().toLocaleTimeString('it', options)
                // })
                break;
              //completed
              case 2:
                sourcePrelievi.push({
                  state: task.error_time ? 4 : 2,
                  components: `PN${task.task_id}`,
                  kit: "45",
                  //   hour: task.stop_time.toLocaleTimeString('it', options)
                  hour: new Date().toLocaleTimeString('it', options),
                  delay: task.computeDelayInMilliseconds() / 1000
                })

                break;
              //failed
              case 3:
              //pending
              case 4:
                this.taskErrorId = task.task_id
                sourceProblems.push({
                  state: 3,
                  id: `PN${task.task_id}`,
                  kit: '45',
                  //hour: task.error_time.toLocaleTimeString('it', options),
                  hour: new Date().toLocaleTimeString('it', options),
                  problemsFound: 'Tipologia Problema',
                  button: '',
                  description: `Problem description`,
                })
                break;
            }

            sourcePrelievi = sourcePrelievi.sort((a, b) => b.hour.localeCompare(a.hour))
            this.dataSourcePrelievi.data = sourcePrelievi

            this.dataSourceProblems.data = sourceProblems

            this.dataSourcePrelievi.paginator = this.paginatorPrelievi
            this.dataSourcePrelievi.sort = this.matSortPrelievi
            this.dataSourceProblems.paginator = this.paginatorErrors
            this.dataSourceProblems.sort = this.matSortProblems
          })
        })

        if (!this.sseSub) {
          console.log("Mi iscrivo");


          this.sseSub = this.sseService
            .getServerSentEvent("http://localhost:4200/API/events")
            .subscribe(data => {

              //console.log("D.d ",data.data);


              let response = JSON.parse(data.data)

              let uc:string = response.uc;

              console.log(uc, this.useCase, response.agv_id, response.agv_id, this.selectedAgv)

              if (uc === this.useCase && response.agv_id !== null && response.agv_id === Number(this.selectedAgv)) {

                if (response.status === "OK") {

                  let taskId = response.task_id

                  let problemFound = false

                  let sourceProblem = this.dataSourceProblems.data.filter(problem => { problemFound = true; return problem.id !== `PN${taskId}` })

                  this.dataSourceProblems.data = sourceProblem

                  let sourcePrelievi = [...this.dataSourcePrelievi.data, {
                    state: problemFound ? 4 : 2,
                    components: `PN${taskId}`,
                    kit: "45",
                    hour: new Date().toLocaleTimeString('it', options),
                    delay: response.delay
                  }]
                  sourcePrelievi = sourcePrelievi.sort((a, b) => b.hour.localeCompare(a.hour))

                  this.dataSourcePrelievi.data = sourcePrelievi

                  this.dataSourcePrelievi.paginator = this.paginatorPrelievi
                  this.dataSourcePrelievi.sort = this.matSortPrelievi

                } else {
                  if (response.status === "NOK") {

                    let taskId = response.task_id
                    this.dataSourceProblems.data = [
                      {
                        state: 3,
                        id: `PN${response.task_id}`,
                        kit: 'Nome kit',
                        hour: new Date().toLocaleTimeString('it', options),
                        problemsFound: 'Tipologia Problema',
                        button: '',
                        description: `Problem description`,
                      }
                    ]

                    this.dataSourceProblems.paginator = this.paginatorErrors
                    this.dataSourceProblems.sort = this.matSortProblems
                  }
                }
              }
            })
        }
      }
    })

    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams['openError']) {
        //Se c'è errore allora lo dobbiamo far vedere
        this.problemPanel.open()
        this.expandedElement = this.dataSourceProblems.data.find(problem => problem.id === `PN${queryParams['openError']}`)
        this.taskErrorId = Number(queryParams['openError'])
        this.isHidingProblemHandling = false
      }
    })
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe()
    this.queryParamsSub.unsubscribe()
    this.sseSub.unsubscribe()
    this.sseSub = null
  }


  headerOfColumn(column: string) {
    switch (column) {
      case 'state':
        return 'Stato';
      case 'id':
        return 'Componente';
      case 'hour':
        return 'Ora';
      case 'problemsFound':
        return 'Problemi Rilevati';
      default:
        break;
    }
  }

  proceed() {
    this.UCCService.getLastActionError(15).subscribe(success => {
      console.log(success[0].error_id);

      //TODO: se la pagina viene aggiornata quando spunta la notifica, queste informazioni non sono presenti
      // e non si sa chi è taskErrorId
      this.UCCService.setSolveAction(this.AGVActionSelected, 1, 1, 1, success[0].error_id).subscribe(response => {
        this.UCCService.setTaskStatusOk(Number(this.taskErrorId)).subscribe(_ => {
          console.log("Risolvi ora", response)
          this.taskErrorId = null
          this.ngOnInit()
        })
      })
    })
  }

  solve(element: Problem) {
    event.stopPropagation();
    //this.dialog.open(ProblemModalComponent);
    this.isHidingProblemHandling = false
    this.expandedElement = element
  }

  openImage(imageSrc: Slide) {
    console.log(imageSrc)
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = "50%"
    dialogConfig.minHeight = "50%"
    dialogConfig.panelClass = "zeroPaddingModal"


    let imageArray = []

    imageArray.push(imageSrc)

    this.problems.forEach(element => {
      if (element.image != imageSrc.image)
        imageArray.push(element)
    });

    dialogConfig.data = {
      images: imageArray
    };
    this.imageDialog.open(ProblemImageComponent, dialogConfig)
  }
}

// const PROBLEMS: Item[] = [
//   {
//     state: 2,
//     id: 'PN 45335478',
//     kit: 'Nome kit',
//     hour: '10:59',
//     problemsFound: 'Tipologia Problema',
//     button: '',
//     description: `Problem description`
//   },
// ]


>>>>>>> 29f32125a9a7f117ffdaa7c7e7e7692d49913c3a
