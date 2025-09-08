
export interface CRMCompany {
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
	/**	Company Name : Data	*/
	company_name?: string
	/**	Company Website : Data	*/
	company_website?: string
	/**	Company Type : Link - CRM Company Type	*/
	company_type?: string
	/**	Company City : Data	*/
	company_city?: string
	/**	Assigned Sales : Data	*/
	assigned_sales?: string
	/**	Last Meeting : Date	*/
	last_meeting?: string
}