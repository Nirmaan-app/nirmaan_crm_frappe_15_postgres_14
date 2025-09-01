
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
	/**	Company Nick : Data	*/
	company_nick?: string
	/**	Company Name : Data	*/
	company_name?: string
	/**	Company Address : Link - Address	*/
	company_address?: string
	/**	Company Logo : Attach	*/
	company_logo?: string
	/**	Company Website : Data	*/
	company_website?: string
	/**	No. of Employees : Data	*/
	no_of_employees?: string
	/**	Annual Revenue : Data	*/
	annual_revenue?: string
	/**	Industry : Link - CRM Company Type	*/
	industry?: string
	/**	Territory : Link - CRM Territory	*/
	territory?: string
	/**	Company Location : Data	*/
	company_location?: string
}