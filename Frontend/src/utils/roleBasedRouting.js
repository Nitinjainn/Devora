/**
 * Utility function to determine the correct dashboard route based on user role
 * @param {Object} user - User object with role property
 * @returns {string} - The appropriate dashboard route
 */
export const getDashboardRouteByRole = (user) => {
  if (!user || !user.role) {
    return "/dashboard/profile"; // Default fallback
  }

  switch (user.role) {
    case "admin":
      return "/admin";
    case "organizer":
      return "/dashboard/organizer-tools";
    case "judge":
      return "/dashboard/judge-panel";
    case "participant":
    default:
      return "/dashboard/profile";
  }
};

/**
 * Utility function to determine if user should be redirected to registration
 * @param {Object} user - User object with profileCompleted property
 * @returns {boolean} - Whether user should complete registration
 */
export const shouldCompleteRegistration = (user) => {
  return !user || !user.profileCompleted;
}; 