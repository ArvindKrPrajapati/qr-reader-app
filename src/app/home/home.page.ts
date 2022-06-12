import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scanActive: boolean = false;
  scanned:boolean=false
  data:any;
  loading:boolean=false

  constructor(private _http:HttpClient,private platform:Platform) {
    // this.scanned=false
    this.platform.backButton.subscribe(() => {
      this.scanned=false
    });
  }

  async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        BarcodeScanner.openAppSettings();
        resolve(false);
      }
    });
  }

  async startScanner() {
    const allowed = await this.checkPermission();

    if (allowed) {
      this.scanActive = true;
      BarcodeScanner.hideBackground();

      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        this.scanActive = false;
        this.checkInServer(result.content)
      } else {
        alert('NO DATA FOUND!');
      }
    } else {
      alert('NOT ALLOWED!');
    }
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  ionViewWillLeave() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  checkInServer(d:any){
    const newd=JSON.parse(d)
    this.scanned=true
    this.loading=true
    if(newd.roll && newd.name && newd.batch && newd.branch){
       const url = "https://equals-api.herokuapp.com/farewell/checkin"
        this._http.post(url,newd).subscribe((res:any)=>{
          this.loading=false
         this.data=res.data[0]
         
        })
     }else{
      this.loading=false
       alert("Invalid QR")
     }
   
  }
}
