import { useViewport } from "@/hooks/useViewPort";


export const contactClick=(contactId)=>{
  const {isMobile}=useViewport()
        if(isMobile){
            return `/contacts/contact?id=${contactId}`
        }else{
            return `/contacts?id=${contactId}`
        }
    }

    export const companyClick=(companyid)=>{
  const {isMobile}=useViewport()
        if(isMobile){
            return `/companies/company?id=${companyid}`
        }else{
            return `/companies?id=${companyid}`
        }
    }


    export const boqClick=(boqid)=>{
  const {isMobile}=useViewport()
        if(isMobile){
            return `/boqs/boq?id=${boqid}`
        }else{
            return `/boqs?id=${boqid}`
        }
    }


    export const taskClick=(boqid)=>{
  const {isMobile}=useViewport()
        if(isMobile){
            return `/tasks/task?id=${boqid}`
        }else{
            return `/tasks?id=${boqid}`
        }
    }