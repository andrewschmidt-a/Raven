import frappe
def after_install():
	add_standard_navbar_items()
	create_default_organization()
	create_default_general_channel()


def create_default_organization():
    if not frappe.db.exists("Raven Organization", "default"):
        organization = frappe.new_doc("Raven Organization")
        organization.organization_name = "raven"
        organization.name = "default"
        organization.save(ignore_permissions=True)
        frappe.db.commit()

def create_default_general_channel():
    if not frappe.db.exists("Raven Channel", {"organization": "default", "name": "general"}):
        channel = frappe.new_doc("Raven Channel")
        channel.channel_name = "General"
        channel.name = "general"
        channel.type = "Open"
        channel.organization = "default"
        channel.save(ignore_permissions=True)
        frappe.db.commit()

def add_standard_navbar_items():
	navbar_settings = frappe.get_single("Navbar Settings")

	raven_navbar_items = [
		{
			"item_label": "Raven",
			"item_type": "Route",
			"route": "/raven",
			"is_standard": 1,
		}
	]

	current_navbar_items = navbar_settings.settings_dropdown
	navbar_settings.set("settings_dropdown", [])

	for item in raven_navbar_items:
		current_labels = [item.get("item_label") for item in current_navbar_items]
		if not item.get("item_label") in current_labels:
			navbar_settings.append("settings_dropdown", item)

	for item in current_navbar_items:
		navbar_settings.append(
			"settings_dropdown",
			{
				"item_label": item.item_label,
				"item_type": item.item_type,
				"route": item.route,
				"action": item.action,
				"is_standard": item.is_standard,
				"hidden": item.hidden,
			},
		)

	navbar_settings.save()