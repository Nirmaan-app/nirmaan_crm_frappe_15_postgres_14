
export interface CRMBOQ{
	name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Company : Link - CRM Company	*/
	company?: string
	/**	Contact : Link - CRM Contacts	*/
	contact?: string
	/**	BOQ Name : Data	*/
	boq_name?: string
	/**	BOQ Size : Data	*/
	boq_size?: string
	/**	BOQ Type : Data	*/
	boq_type?: string
	/**	BOQ Value : Data	*/
	boq_value?: string
	/**	BOQ Submission Date : Date	*/
	boq_submission_date?: string
	/**	BOQ Link : Data	*/
	boq_link?: string
	/**	City : Data	*/
	city?: string
	/**	Remarks : Text	*/
	remarks?: string
	/**	BOQ Status : Data	*/
	boq_status?: string
	/**	BOQ Sub Status : Data	*/
	boq_sub_status?: string
	/**	Assigned Sales : Data	*/
	assigned_sales?: string
	/**	Assigned Estimations : Data	*/
	assigned_estimations?: string
	/**	Deal Status : Data	*/
	deal_status?: string
	/**	Client Deal Status : Data	*/
	client_deal_status?: string
}