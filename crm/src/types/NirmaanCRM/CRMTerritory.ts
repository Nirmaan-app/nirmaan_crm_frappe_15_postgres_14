
export interface CRMTerritory{
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
	/**	Territory Name : Data	*/
	territory_name?: string
	/**	Territory Manager : Link - Nirmaan Users	*/
	territory_manager?: string
	/**	Parent CRM Territory : Link - CRM Territory	*/
	parent_crm_territory?: string
}