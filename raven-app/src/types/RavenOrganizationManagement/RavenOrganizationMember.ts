
export interface RavenOrganizationMember{
	creation: string
	name: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Organization : Link - Raven Organization	*/
	organization: string
	/**	User : Link - Raven User	*/
	user: string
	/**	Create Channel : Check	*/
	create_channel?: 0 | 1
	/**	Edit Channel : Check	*/
	edit_channel?: 0 | 1
	/**	Delete Channel : Check	*/
	delete_channel?: 0 | 1
	/**	Create Message : Check	*/
	create_message?: 0 | 1
	/**	Edit Message : Check	*/
	edit_message?: 0 | 1
	/**	Delete Message : Check	*/
	delete_message?: 0 | 1
	/**	Create Channel Member : Check	*/
	create_channel_member?: 0 | 1
	/**	Edit Channel Member : Check	*/
	edit_channel_member?: 0 | 1
	/**	Delete Channel Member : Check	*/
	delete_channel_member?: 0 | 1
	/**	Create Organization Member : Check	*/
	create_organization_member?: 0 | 1
	/**	Edit Organization Member : Check	*/
	edit_organization_member?: 0 | 1
	/**	Delete Organization Member : Check	*/
	delete_organization_member?: 0 | 1
	/**	Role : Link - Raven Organization Role	*/
	role?: string
}