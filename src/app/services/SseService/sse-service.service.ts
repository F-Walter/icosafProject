<<<<<<< HEAD
import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SseService {


  //NgZone to alert Angular when an event occurs because it happens outside of the framework.
  
  constructor(private ngZone: NgZone) { }

  /**
   * Creates event source
   * @param url
   */
  getEventSource(url: string): EventSource {
    return new EventSource(url);
  }

  getServerSentEvent(url: string) {
  //  console.log("before")
    return Observable.create(observer => {
    //  console.log("middle")
      const eventSource = this.getEventSource(url);
      //console.log("after")

      eventSource.onmessage = event => {
        //success
        console.log("SseService on success");
        this.ngZone.run(() => {
          observer.next(event);
        })

      }
      eventSource.onerror = error => {
        console.log("SseService on Error");
        this.ngZone.run(() => {
          observer.next(error);
        })
      }
    })

  }
}
=======
import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SseService {


  //NgZone to alert Angular when an event occurs because it happens outside of the framework.
  
  constructor(private ngZone: NgZone) { }

  /**
   * Creates event source
   * @param url
   */
  getEventSource(url: string): EventSource {
    return new EventSource(url);
  }

  getServerSentEvent(url: string) {
  //  console.log("before")
    return Observable.create(observer => {
    //  console.log("middle")
      const eventSource = this.getEventSource(url);
      //console.log("after")

      eventSource.onmessage = event => {
        //success
        console.log("SseService on success");
        this.ngZone.run(() => {
          observer.next(event);
        })

      }
      eventSource.onerror = error => {
        console.log("SseService on Error");
        this.ngZone.run(() => {
          observer.next(error);
        })
      }
    })

  }
}
>>>>>>> 29f32125a9a7f117ffdaa7c7e7e7692d49913c3a
