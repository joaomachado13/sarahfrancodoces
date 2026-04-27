-- Cria o trigger que faltava para atribuir role automaticamente em novos signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Corrige o caso da Sarah (criada antes do trigger existir)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'sarahalfr@hotmail.com'
ON CONFLICT DO NOTHING;