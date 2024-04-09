import frappe


def organization_has_permission(doc, user=None, ptype=None):

    is_member = frappe.db.exists("Raven Organization Member", {
                                 "organization": doc.name, "user": user})

    user_roles = frappe.get_roles(user)

    is_raven_admin = "Raven Administrator" in user_roles

    if not user:
        user = frappe.session.user

    if user == "Administrator":
        return True

    if doc.type == "Public":
        if ptype == "read":
            return True
        else:   # Create, Delete or Write
            if is_raven_admin:
                return True
            else:
                return False
    else:   # Private
        if ptype == "read":
            if is_member:
                return True
            elif doc.owner == user:
                return True
            else:
                return False
        elif ptype == "create":
            if is_raven_admin:
                return True
            else:
                return False
        else:
            if is_raven_admin and is_member:
                return True
            elif doc.owner == user:
                return True
            else:
                return False


def organization_member_has_permission(doc, user=None, ptype=None):

    is_member = frappe.db.exists("Raven Organization Member", {
                                 "organization": doc.organization, "user": user})

    user_roles = frappe.get_roles(user)

    is_raven_admin = "Raven Administrator" in user_roles

    if not user:
        user = frappe.session.user

    organization_type = frappe.get_cached_value(
        "Raven Organization", doc.organization, "type")

    if user == "Administrator":
        return True

    if organization_type == "Public":
        if ptype == "read":
            return True
        elif doc.user == user:
            if ptype == "create":
                return True
            elif ptype == "delete":
                return True
            else:
                return False
        elif is_raven_admin:
            return True
        else:
            return False
    else:   # Private
        if ptype == "read":
            if is_member:
                return True
            else:
                return False
        elif is_raven_admin:
            if is_member:
                return True
            else:
                return False
        elif ptype == "delete":
            if doc.user == user:
                return True
            else:
                return False
        else:
            return False


def channel_has_permission(doc, user=None, ptype=None):

    if doc.type == "Open" or doc.type == "Public":
        return True
    elif doc.type == "Private":
        if frappe.db.exists("Raven Channel Member", {"channel_id": doc.name, "user_id": user}):
            return True
        elif doc.owner == user and frappe.db.count("Raven Channel Member", {"channel_id": doc.name}) <= 0:
            return True
        elif user == "Administrator":
            return True
        else:
            return False


def channel_member_has_permission(doc, user=None, ptype=None):

    # Allow self to modify their own channel member document
    if doc.user_id == user:
        return True

    channel_type = frappe.get_cached_value(
        "Raven Channel", doc.channel_id, "type")

    if channel_type == "Open" or channel_type == "Public":
        return True

    if channel_type == "Private":
        # If it's a private channel, only the members can modify the channel member
        if frappe.db.exists("Raven Channel Member", {"channel_id": doc.channel_id, "user_id": user}):
            return True
        elif user == "Administrator":
            return True
        else:
            return False


def message_has_permission(doc, user=None, ptype=None):

    organization = frappe.get_cached_value(
        "Raven Channel", doc.channel_id, "organization")

    organization_type = frappe.get_cached_value(
        "Raven Organization", organization, "type")

    if organization_type == "Public":
        return message_has_permission_in_channel(doc, user, ptype)
    else:
        if frappe.db.exists("Raven Organization Member", {"organization": organization, "user": user}):
            return message_has_permission_in_channel(doc, user, ptype)
        elif user == "Administrator":
            return True
        else:
            return False


def message_has_permission_in_channel(doc, user=None, ptype=None):

    channel_type = frappe.get_cached_value(
        "Raven Channel", doc.channel_id, "type")

    # If the channel is open, a user can post a message.
    # For creating or deleting a message, the permission check is added in the validate method of Raven Message
    if channel_type == "Open":
        if ptype == "read":
            return True
        else:
            return doc.owner == user

    # If the channel is public, a user can read a message.
    if channel_type == "Public":
        if ptype == "read":
            return True

    if frappe.db.exists("Raven Channel Member", {"channel_id": doc.channel_id, "user_id": user}):
        if ptype == "read":
            return True
        else:
            return doc.owner == user
    elif user == "Administrator":
        return True
    else:
        return False


def raven_channel_query(user):
    if not user:
        user = frappe.session.user

    '''
      Only show channels that the user is a owner of

      We could also remove "Raven User" from the Raven Channel doctype role, but then permission checks for joining socket rooms for the channel would fail

      Hence, we are adding a WHERE clause to the query - this is inconsequential since we will never use the standard get_list query for Raven Channel,
      but needed for security since we do not want users to be able to view channels they are not a member of
    '''
    return "`tabRaven Channel`.owner = {user}".format(user=frappe.db.escape(user))


def raven_message_query(user):
    if not user:
        user = frappe.session.user

    '''
      Only show messages created by the user using a WHERE clause

      We could also remove "Raven User" from the Raven Message doctype role, but then permission checks for attached files would also fail.

      Hence, we are adding a WHERE clause to the query - this is inconsequential since we will never use the standard get_list query for Raven Message,
      but needed for security since we do not want users to be able to view messages from channels they are not a member of
    '''
    return "`tabRaven Message`.owner = {user}".format(user=frappe.db.escape(user))
