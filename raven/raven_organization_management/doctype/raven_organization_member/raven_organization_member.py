# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenOrganizationMember(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		create_channel: DF.Check
		create_channel_member: DF.Check
		create_message: DF.Check
		create_organization_member: DF.Check
		delete_channel: DF.Check
		delete_channel_member: DF.Check
		delete_message: DF.Check
		delete_organization_member: DF.Check
		edit_channel: DF.Check
		edit_channel_member: DF.Check
		edit_message: DF.Check
		edit_organization_member: DF.Check
		organization: DF.Link
		role: DF.Link | None
		user: DF.Link
	# end: auto-generated types

	pass
