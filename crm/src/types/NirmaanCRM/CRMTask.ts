
export interface CRMTask{
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
	/**	BOQ : Link - CRM BOQ	*/
	boq?: string
	/**	Title : Data	*/
	title?: string
	/**	Type : Data	*/
	type?: string
	/**	Date : Date	*/
	start_date?: string
	/**	Assigned Sales : Data	*/
	assigned_sales?: string
	/**	Status : Data	*/
	status?: string
	/**	Reason : Data	*/
	reason?: string
	/**	Time : Time	*/
	time?: string
	/**	Remarks : Text	*/
	remarks?: string
}