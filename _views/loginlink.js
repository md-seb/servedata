export default function LoginLink({_id}) {
  return `
    <form method=POST action=/form/action/loginwithlink/redir/profile> 
      <input type=hidden name=id value=${_id}>
      <button>Login</button>
    </form>
  `
}
