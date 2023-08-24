export const handleLogout = (submit) => {
    submit({ _action: "logout" }, { method: "POST" });
}
