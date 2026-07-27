// Script para crear el super admin usando signUp + actualizar rol via SQL
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://xcmqxnpjhguykjqoxzyc.supabase.co",
  "sb_publishable_pW1V5bANOLIoQI0zDHAcIQ_0BliR_PL"
);

async function main() {
  console.log("Registrando usuario...");
  
  const { data, error } = await supabase.auth.signUp({
    email: "superadmin@ziesta.com.ar",
    password: "0303@Ziesta@@",
    options: {
      data: {
        full_name: "Super Admin",
        role: "admin",
      },
    },
  });

  if (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log("✅ Usuario registrado:");
  console.log("   ID:", data.user?.id);
  console.log("   Email:", data.user?.email);
  console.log("   Confirmed:", data.user?.email_confirmed_at ? "Sí" : "No (necesita confirmar email)");
  console.log("   Session:", data.session ? "Sí" : "No");
}

main();
