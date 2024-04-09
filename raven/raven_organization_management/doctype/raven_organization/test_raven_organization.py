# Copyright (c) 2024, The Commit Company and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


def read_organization(org):
    return frappe.get_list("Raven Organization", filters={
        "organization_name": org.organization_name}, fields=["name", "type"])


def edit_organization(org):
    org.organization_name = "Test Organization Edited"
    return org.save()


def delete_organization(org):
    frappe.db.delete("Raven Organization", org.name)
    return True


def create_organization(type):
    org = frappe.get_doc({
        "doctype": "Raven Organization",
        "organization_name": "Created Test Organization",
        "type": type
    })
    org.insert()
    return org


class TestRavenOrganization(FrappeTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        user = frappe.get_doc("User", "test1@example.com")
        user.add_roles("Raven Administrator")
        raven_user = frappe.get_doc({
            "doctype": "Raven User",
            "user": "test1@example.com"
        })
        raven_user.insert(ignore_permissions=True)

        user = frappe.get_doc("User", "test2@example.com")
        user.add_roles("Raven User")

    def tearDown(self):
        frappe.set_user("Administrator")
        frappe.db.sql("DELETE FROM `tabRaven Organization`")
        frappe.db.sql("DELETE FROM `tabRaven Organization Member`")

    def test_raven_admin_not_member_permissions_public_org(self):
        # Testing the permissions of a Raven Administrator who is not a member of the public organization
        frappe.set_user("test1@example.com")

        # Public Organization
        org = frappe.get_doc({
            "doctype": "Raven Organization",
            "organization_name": "Test Organization",
            "type": "Public"
        })
        org.insert(ignore_permissions=True)

        # Can read the organization
        self.assertTrue(read_organization(org))
        # Can edit the organization
        self.assertTrue(edit_organization(org))
        # Can delete the organization
        self.assertTrue(delete_organization(org))
        # Can create an organization
        self.assertTrue(create_organization('Public'))

    def test_raven_admin_not_member_permissions_private_org(self):
        # Testing the permissions of a Raven Administrator who is not a member of the private organization
        frappe.set_user("test1@example.com")

        # Private Organization
        org = frappe.get_doc({
            "doctype": "Raven Organization",
            "organization_name": "Test Organization",
            "type": "Private"
        })

        org.insert(ignore_permissions=True)

        # Cannot read the organization
        with self.assertRaises(frappe.exceptions.PermissionError):
            read_organization(org)
        # Cannot edit the organization
        with self.assertRaises(frappe.exceptions.PermissionError):
            edit_organization(org)
        # Cannot delete the organization
        self.assertRaises(frappe.exceptions.PermissionError,
                          delete_organization(org))
        # Can create an organization
        self.assertTrue(create_organization('Private'))

    def test_raven_admin_member_permissions_private_org(self):
        # Testing the permissions of a Raven Administrator who is a member of the organization
        frappe.set_user("test1@example.com")

        # Private Organization
        org = frappe.get_doc({
            "doctype": "Raven Organization",
            "organization_name": "Test Organization",
            "type": "Private"
        })
        org.insert(ignore_permissions=True)

        org_member = frappe.get_doc({
            "doctype": "Raven Organization Member",
            "organization": org.name,
            "user": "test1@example.com"
        })
        org_member.insert(ignore_permissions=True)

        # Can read the organization
        self.assertTrue(read_organization(org))
        # Can edit the organization
        self.assertTrue(edit_organization(org))
        # Can delete the organization
        self.assertTrue(delete_organization(org))

    def test_raven_user_not_member_permissions_public_org(self):
        # Testing the permissions of a Raven User who is not a member of the public organization
        frappe.set_user("test2@example.com")

        # Public Organization
        org = frappe.get_doc({
            "doctype": "Raven Organization",
            "organization_name": "Test Organization",
            "type": "Public"
        })
        org.insert(ignore_permissions=True)

        # Can read the organization
        with self.subTest():
            self.assertTrue(read_organization(org))
        # Cannot edit the organization
        with self.assertRaises(frappe.exceptions.PermissionError):
            edit_organization(org)
        # Cannot delete the organization
        self.assertRaises(frappe.exceptions.PermissionError,
                          delete_organization(org))
        # Cannot create an organization
        self.assertRaises(frappe.exceptions.PermissionError,
                          create_organization('Public'))

    def test_raven_user_not_member_permissions_private_org(self):
        # Testing the permissions of a Raven User who is not a member of the private organization
        frappe.set_user("test2@example.com")

        # Private Organization
        org = frappe.get_doc({
            "doctype": "Raven Organization",
            "organization_name": "Test Organization",
            "type": "Private"
        })
        org.insert(ignore_permissions=True)

        # Cannot read the organization
        with self.assertRaises(frappe.exceptions.PermissionError):
            read_organization(org)

        # Cannot edit the organization
        with self.assertRaises(frappe.exceptions.PermissionError):
            edit_organization(org)

        # Cannot delete the organization
        self.assertRaises(frappe.exceptions.PermissionError,
                          delete_organization(org))

        # Cannot create an organization
        self.assertRaises(frappe.exceptions.PermissionError,
                          create_organization('Private'))

    def test_raven_user_member_permissions_private_org(self):
        # Testing the permissions of a Raven User who is a member of the private organization
        frappe.set_user("test2@example.com")

        # Private Organization
        org = frappe.get_doc({
            "doctype": "Raven Organization",
            "organization_name": "Test Organization",
            "type": "Private"
        })
        org.insert(ignore_permissions=True)

        org_member = frappe.get_doc({
            "doctype": "Raven Organization Member",
            "organization": org.name,
            "user": "test2@example.com"
        })

        org_member.insert(ignore_permissions=True)

        # Can read the organization
        self.assertTrue(read_organization(org))

        # Cannot edit the organization
        with self.assertRaises(frappe.exceptions.PermissionError):
            edit_organization(org)

        # Cannot delete the organization
        self.assertRaises(frappe.exceptions.PermissionError,
                          delete_organization(org))

        # Cannot create an organization
        self.assertRaises(frappe.exceptions.PermissionError,
                          create_organization('Private'))
