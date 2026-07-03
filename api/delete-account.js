import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, accessToken } = req.body;
    if (!userId || !accessToken) {
      return res.status(400).json({ error: "Falta userId o accessToken" });
    }

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Configuración del servidor incompleta (falta SUPABASE_SERVICE_ROLE_KEY)" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: tokenUser, error: tokenErr } = await admin.auth.getUser(accessToken);
    if (tokenErr || !tokenUser?.user || tokenUser.user.id !== userId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const tables = ["diary_entries", "daily_practices", "streaks", "plan_progress"];
    for (const table of tables) {
      await admin.from(table).delete().eq("user_id", userId);
    }
    await admin.from("profiles").delete().eq("id", userId);

    try {
      const { data: files } = await admin.storage.from("avatars").list(userId);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await admin.storage.from("avatars").remove(paths);
      }
    } catch (e) {
      // No bloquea el borrado de la cuenta si esto falla
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) throw delErr;

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
