import { isAdmin } from "@/lib/guard";
import { getAdminProfile, updateAdminProfile } from "@/lib/admin-profile";

export const dynamic = "force-dynamic";

// GET /api/admin/profile
export async function GET(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const profile = await getAdminProfile();
    return Response.json({
      success: true,
      profile: {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        email: profile.email || "",
        avatar: profile.avatar || "",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/profile error:", error);
    return Response.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 });
  }
}

// PUT /api/admin/profile
export async function PUT(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, email, password, confirmPassword, avatar } = body;

    // Validation email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email).trim())) {
        return Response.json({ error: "Adresse email invalide" }, { status: 400 });
      }
    }

    // Validation mot de passe
    if (password) {
      if (String(password).length < 4) {
        return Response.json(
          { error: "Le mot de passe doit comporter au moins 4 caractères" },
          { status: 400 }
        );
      }
      if (confirmPassword && password !== confirmPassword) {
        return Response.json(
          { error: "Les deux mots de passe ne correspondent pas" },
          { status: 400 }
        );
      }
    }

    const updated = await updateAdminProfile({
      firstName,
      lastName,
      phone,
      email: email ? String(email).trim() : undefined,
      password: password ? String(password).trim() : undefined,
      avatar,
    });

    return Response.json({
      success: true,
      message: "Profil administrateur mis à jour avec succès",
      profile: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        email: updated.email,
        avatar: updated.avatar,
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/profile error:", error);
    return Response.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 });
  }
}
