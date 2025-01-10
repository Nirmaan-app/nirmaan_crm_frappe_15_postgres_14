
export interface CRMLeadStatus{
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
	/**	Status Name : Data	*/
	status_name?: string
	/**	Color : Data	*/
	color?: string
	/**	Position : Data	*/
	position?: string
}