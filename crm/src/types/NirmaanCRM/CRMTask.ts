
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
	/**	Reference Doctype : Link - DocType	*/
	reference_doctype?: string
	/**	Reference Docname : Dynamic Link	*/
	reference_docname?: string
	/**	Title : Data	*/
	title?: string
	/**	Type : Data	*/
	type?: string
	/**	Priority : Data	*/
	priority?: string
	/**	Start Date : Data	*/
	start_date?: string
	/**	Assigned To : Link - Nirmaan Users	*/
	assigned_to?: string
	/**	Status : Data	*/
	status?: string
	/**	Due Date : Data	*/
	due_date?: string
	/**	Description : Data	*/
	description?: string
}