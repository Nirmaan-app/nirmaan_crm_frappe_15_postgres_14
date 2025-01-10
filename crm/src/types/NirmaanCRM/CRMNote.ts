
export interface CRMNote{
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
	/**	Content : Data	*/
	content?: string
}