
export interface CRMLeads{
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
	/**	Contact : Link - CRM Contacts	*/
	contact?: string
	/**	Company : Link - CRM Company	*/
	company?: string
	/**	Project Name : Data	*/
	project_name?: string
	/**	Project Address : Link - Address	*/
	project_address?: string
	/**	Project Type : Link - Project Types	*/
	project_type?: string
	/**	Project Work Packages : JSON	*/
	project_work_packages?: any
	/**	BOQ Attachment : Attach	*/
	boq_attachment?: string
	/**	Lead Date : Data	*/
	lead_date?: string
	/**	Last Submitted Date : Data	*/
	last_submitted_date?: string
	/**	Is Converted : Data	*/
	is_converted?: string
	/**	Lead Owner : Link - Nirmaan Users	*/
	lead_owner?: string
	/**	Lead Source : Data	*/
	lead_source?: string
	/**	Lead Status : Link - CRM Lead Status	*/
	lead_status?: string
}