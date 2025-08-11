export interface CRMPBOQ{
  name: string
	project_name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	idx?: number
	/**	Company Id : Link - CRM Company	*/
	project_company?: string
	/**	Contact Id : Link - CRM Contacts	*/
	project_contact?: string
	/**	Project Location : Data	*/
	project_location?: string
	/**	Project Size : Data	*/
	project_size?: string
	/**	Project Type : Data	*/
	project_type?: string
  /** Project Packages: Data */
  project_packages?: string
	/** Project Status: Data */
	project_status? : string
	/** BOQ Date: Datetime */
	boq_date? : string

}