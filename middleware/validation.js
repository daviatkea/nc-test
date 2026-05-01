function createValidationMiddleware({ router, sendError }) {
  function hasOwn(body, field) {
    return Object.prototype.hasOwnProperty.call(body, field);
  }

  function shouldValidate(body, field, mode) {
    return mode === "create" || hasOwn(body, field);
  }

  function addError(errors, field, message, code = "invalid") {
    errors.push({ field, message, code });
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function isValidDateString(value) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
  }

  function isPositiveIntegerLike(value) {
    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0;
  }

  const tableCapacities = Object.freeze({
    1: 4,
    2: 4,
    3: 6,
    4: 4,
    5: 8,
    6: 4,
    7: 4,
    8: 6,
    9: 4,
    10: 8,
    11: 4,
    12: 4,
    13: 6,
    14: 4,
    15: 8,
  });

  function isValidEmail(value) {
    return (
      typeof value === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    );
  }

  function isValidUrl(value) {
    if (typeof value !== "string") {
      return false;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  function isValidRootRelativePath(value) {
    return (
      typeof value === "string" &&
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !/[\s\\]/.test(value)
    );
  }

  function isValidAssetUrl(value) {
    return isValidUrl(value) || isValidRootRelativePath(value);
  }

  function parseResourceSegments(requestPath) {
    const [resource, id] = requestPath.split("/").filter(Boolean);
    if (id === undefined) {
      return { resource, id: undefined };
    }

    const numericId = Number(id);

    return {
      resource,
      id: Number.isNaN(numericId) ? id : numericId,
    };
  }

  function validateRequiredString(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isNonEmptyString(body[field])) {
      addError(errors, field, `${label} must be a non-empty string.`);
    }
  }

  function validateRequiredDate(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isValidDateString(body[field])) {
      addError(errors, field, `${label} must be a valid ISO date string.`);
    }
  }

  function validateRequiredEmail(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isValidEmail(body[field])) {
      addError(errors, field, `${label} must be a valid email address.`);
    }
  }

  function validateRequiredPositiveInteger(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isPositiveIntegerLike(body[field])) {
      addError(errors, field, `${label} must be a positive whole number.`);
    }
  }

  function getTableCapacity(table) {
    if (!isPositiveIntegerLike(table)) {
      return undefined;
    }

    return tableCapacities[Number(table)];
  }

  function validateRequiredAsset(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    const asset = body[field];

    if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
      addError(
        errors,
        `${field}.url`,
        `${label} must include a valid asset.url.`,
      );
      return;
    }

    if (!isValidAssetUrl(asset.url)) {
      addError(
        errors,
        `${field}.url`,
        `${label} asset.url must be a valid URL or root-relative path.`,
      );
    }
  }

  function validateOptionalUrl(body, field, label, errors) {
    if (!hasOwn(body, field) || body[field] === "" || body[field] == null) {
      return;
    }

    if (!isValidUrl(body[field])) {
      addError(errors, field, `${label} must be a valid URL.`);
    }
  }

  function newsletterEmailExists(email, currentId) {
    const normalizedEmail = email.trim().toLowerCase();

    return (
      router.db
        .get("newsletters")
        .find(
          (item) =>
            typeof item.email === "string" &&
            item.email.trim().toLowerCase() === normalizedEmail &&
            item.id !== currentId,
        )
        .value() != null
    );
  }

  function getReservationById(reservationId) {
    return (
      router.db
        .get("reservations")
        .find({ id: Number(reservationId) })
        .value() ?? null
    );
  }

  function getEventById(eventId) {
    if (!isPositiveIntegerLike(eventId)) {
      return null;
    }

    return (
      router.db
        .get("events")
        .find({ id: Number(eventId) })
        .value() ?? null
    );
  }

  function normalizeCalendarDate(value) {
    if (!isValidDateString(value)) {
      return null;
    }

    return new Date(value).toISOString().slice(0, 10);
  }

  function reservationConflictExists(table, date, currentId) {
    const normalizedTable = String(Number(table));
    const normalizedDate = normalizeCalendarDate(date);

    if (!isPositiveIntegerLike(table) || !normalizedDate) {
      return false;
    }

    return (
      router.db
        .get("reservations")
        .find(
          (item) =>
            String(Number(item.table)) === normalizedTable &&
            normalizeCalendarDate(item.date) === normalizedDate &&
            item.id !== currentId,
        )
        .value() != null
    );
  }

  const validators = {
    comments(body, mode) {
      const errors = [];

      validateRequiredPositiveInteger(
        body,
        "eventId",
        "eventId",
        errors,
        mode,
      );
      if (
        shouldValidate(body, "eventId", mode) &&
        isPositiveIntegerLike(body.eventId)
      ) {
        if (!getEventById(body.eventId)) {
          addError(
            errors,
            "eventId",
            "eventId must reference an existing event.",
          );
        }
      }

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredString(body, "content", "content", errors, mode);
      validateRequiredDate(body, "date", "date", errors, mode);

      return errors;
    },
    gallery(body, mode) {
      const errors = [];

      validateRequiredString(body, "description", "description", errors, mode);
      validateRequiredAsset(body, "asset", "asset", errors, mode);

      return errors;
    },
    testimonials(body, mode) {
      const errors = [];

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredString(body, "content", "content", errors, mode);
      validateRequiredAsset(body, "asset", "asset", errors, mode);
      validateOptionalUrl(body, "facebook", "facebook", errors);
      validateOptionalUrl(body, "twitter", "twitter", errors);

      return errors;
    },
    contact_messages(body, mode) {
      const errors = [];

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredEmail(body, "email", "email", errors, mode);
      validateRequiredString(body, "content", "content", errors, mode);
      validateRequiredDate(body, "date", "date", errors, mode);

      return errors;
    },
    reservations(body, mode, resourceId) {
      const errors = [];

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredEmail(body, "email", "email", errors, mode);
      validateRequiredPositiveInteger(body, "table", "table", errors, mode);
      validateRequiredPositiveInteger(body, "guests", "guests", errors, mode);
      validateRequiredDate(body, "date", "date", errors, mode);
      validateRequiredString(body, "phone", "phone", errors, mode);

      const existingReservation =
        mode === "update" && resourceId != null
          ? getReservationById(resourceId)
          : null;
      const effectiveTable = hasOwn(body, "table")
        ? body.table
        : existingReservation?.table;
      const effectiveGuests = hasOwn(body, "guests")
        ? body.guests
        : existingReservation?.guests;
      const effectiveDate = hasOwn(body, "date")
        ? body.date
        : existingReservation?.date;
      const effectiveEventId = hasOwn(body, "eventId")
        ? body.eventId
        : existingReservation?.eventId;
      const shouldCheckCapacity =
        mode === "create" || hasOwn(body, "table") || hasOwn(body, "guests");

      if (shouldCheckCapacity && isPositiveIntegerLike(effectiveTable)) {
        const capacity = getTableCapacity(effectiveTable);

        if (capacity === undefined) {
          addError(errors, "table", "table must reference an available table.");
        } else if (
          isPositiveIntegerLike(effectiveGuests) &&
          Number(effectiveGuests) > capacity
        ) {
          addError(
            errors,
            "guests",
            `guests must not exceed table ${Number(effectiveTable)} capacity of ${capacity}.`,
          );
        }
      }

      const hasEventId =
        effectiveEventId !== undefined &&
        effectiveEventId !== null &&
        effectiveEventId !== "";
      const shouldCheckEvent =
        hasEventId &&
        (mode === "create" ||
          hasOwn(body, "eventId") ||
          hasOwn(body, "date"));

      if (shouldCheckEvent) {
        if (!isPositiveIntegerLike(effectiveEventId)) {
          addError(
            errors,
            "eventId",
            "eventId must reference an existing event.",
          );
        } else {
          const event = getEventById(effectiveEventId);

          if (!event) {
            addError(
              errors,
              "eventId",
              "eventId must reference an existing event.",
            );
          } else if (
            normalizeCalendarDate(effectiveDate) !==
            normalizeCalendarDate(event.date)
          ) {
            addError(
              errors,
              "date",
              "date must be on the same calendar date as the selected event.",
            );
          }
        }
      }

      const shouldCheckConflict =
        mode === "create" || hasOwn(body, "table") || hasOwn(body, "date");

      if (
        shouldCheckConflict &&
        reservationConflictExists(effectiveTable, effectiveDate, resourceId)
      ) {
        addError(
          errors,
          "table",
          "This table is already reserved for the selected date.",
          "conflict",
        );
      }

      return errors;
    },
    newsletters(body, mode, resourceId) {
      const errors = [];

      validateRequiredEmail(body, "email", "email", errors, mode);
      if (shouldValidate(body, "email", mode) && isValidEmail(body.email)) {
        if (newsletterEmailExists(body.email, resourceId)) {
          addError(
            errors,
            "email",
            "This email address is already subscribed.",
            "conflict",
          );
        }
      }

      return errors;
    },
  };

  return function validationMiddleware(req, res, next) {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      next();
      return;
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      sendError(
        res,
        400,
        "INVALID_BODY",
        "Request body must be a JSON object.",
      );
      return;
    }

    if (req.method === "POST" && hasOwn(req.body, "id")) {
      // Create requests should never trust client-supplied ids.
      delete req.body.id;
    }

    const { resource, id } = parseResourceSegments(req.path);
    const validator = validators[resource];

    if (!validator) {
      next();
      return;
    }

    const mode = req.method === "PATCH" ? "update" : "create";
    const errors = validator(req.body, mode, id);

    if (errors.length > 0) {
      const status = errors.some((error) => error.code === "conflict")
        ? 409
        : 400;
      const isDuplicateNewsletter =
        resource === "newsletters" &&
        errors.some(
          (error) => error.field === "email" && error.code === "conflict",
        );
      let code = "VALIDATION_ERROR";
      let message = "Request validation failed.";

      if (isDuplicateNewsletter) {
        code = "EMAIL_ALREADY_SUBSCRIBED";
        message = "This email address is already subscribed.";
      } else if (status === 409) {
        code = "RESOURCE_CONFLICT";
        message = "Request conflicts with existing data.";
      }

      sendError(res, status, code, message, errors);
      return;
    }

    next();
  };
}

module.exports = createValidationMiddleware;
