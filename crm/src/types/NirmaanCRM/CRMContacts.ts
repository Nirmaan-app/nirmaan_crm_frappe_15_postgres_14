
export interface CRMContacts{
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
	/**	First Name : Data	*/
	first_name?: string
	/**	Last Name : Data	*/
	last_name?: string
	/**	Gender : Data	*/
	gender?: string
	/**	Mobile : Data	*/
	mobile?: string
	/**	Email : Data	*/
	email?: string
	/**	Designation : Data	*/
	designation?: string
	/**	Department : Data	*/
	department?: string
	/**	Visiting Card : Data	*/
	visiting_card?: string
	/**	Assigned Sales : Data	*/
	assigned_sales?: string
	/**	Last Meeting : Date	*/
	last_meeting?: string
}