export interface CRMPBOQ{
  name: string
	boq_name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	idx?: number
	/**	Company Id : Link - CRM Company	*/
	boq_company?: string
	/**	Contact Id : Link - CRM Contacts	*/
	boq_contact?: string
	/**	Project Location : Data	*/
	boq_location?: string
	/**	Project Size : Data	*/
	boq_size?: string
	/**	Project Type : Data	*/
	boq_type?: string
  /** Project Packages: Data */
  boq_packages?: string
	/** Project Status: Data */
	boq_status? : string
	/** BOQ Date: Datetime */
	boq_date? : string

}