import pool from "../../config/db.js";

// =====================================================
// GET CUSTOMER DASHBOARD
// =====================================================

export const getCustomerDashboard = async (req, res) => {
  try {

    const { customerId } = req.params;

    // =====================================================
    // CHECK CUSTOMER ID
    // =====================================================

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required",
      });
    }


    // =====================================================
    // CUSTOMER DETAILS
    // =====================================================

    const customerResult = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        status,
        created_at
      FROM customers
      WHERE id = $1
      `,
      [customerId]
    );


    // =====================================================
    // CUSTOMER NOT FOUND
    // =====================================================

    if (customerResult.rows.length === 0) {

      return res.status(404).json({
        message: "Customer not found",
      });

    }

    const customer = customerResult.rows[0];


    // =====================================================
    // BOOKING STATISTICS
    // =====================================================

    const statisticsResult = await pool.query(
      `
      SELECT

        /* =================================================
           TOTAL BOOKINGS
        ================================================= */

        COUNT(*) AS total_bookings,


        /* =================================================
           UPCOMING BOOKINGS
           
           Upcoming means:
           
           1. Check-in date is today or future
           2. Booking status is CONFIRMED
           
           Therefore:
           
           confirmed  -> SHOW
           checked_in -> DO NOT SHOW
           checked_out -> DO NOT SHOW
           cancelled -> DO NOT SHOW
        ================================================= */

        COUNT(*) FILTER (
          WHERE
            check_in >= CURRENT_DATE

            AND LOWER(
              TRIM(
                COALESCE(
                  booking_status,
                  ''
                )
              )
            ) = 'confirmed'
        ) AS upcoming,


        /* =================================================
           COMPLETED BOOKINGS
           
           Completed = checked_out
        ================================================= */

        COUNT(*) FILTER (
          WHERE
            LOWER(
              TRIM(
                COALESCE(
                  booking_status,
                  ''
                )
              )
            ) = 'checked_out'
        ) AS completed,


        /* =================================================
           CONFIRMED BOOKINGS
        ================================================= */

        COUNT(*) FILTER (
          WHERE
            LOWER(
              TRIM(
                COALESCE(
                  booking_status,
                  ''
                )
              )
            ) = 'confirmed'
        ) AS confirmed,


        /* =================================================
           CANCELLED BOOKINGS
        ================================================= */

        COUNT(*) FILTER (
          WHERE
            LOWER(
              TRIM(
                COALESCE(
                  booking_status,
                  ''
                )
              )
            ) = 'cancelled'
        ) AS cancelled,


        /* =================================================
           CHECKED IN BOOKINGS
        ================================================= */

        COUNT(*) FILTER (
          WHERE
            LOWER(
              TRIM(
                COALESCE(
                  booking_status,
                  ''
                )
              )
            ) = 'checked_in'
        ) AS checked_in,


        /* =================================================
           CHECKED OUT BOOKINGS
        ================================================= */

        COUNT(*) FILTER (
          WHERE
            LOWER(
              TRIM(
                COALESCE(
                  booking_status,
                  ''
                )
              )
            ) = 'checked_out'

        ) AS checked_out


      FROM bookings

      WHERE customer_id = $1
      `,
      [customerId]
    );


    const statistics =
      statisticsResult.rows[0];


    // =====================================================
    // TOTAL SPENT
    // =====================================================

    const paymentResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(p.amount),
          0
        ) AS total_spent

      FROM payments p

      INNER JOIN bookings b
        ON p.booking_id = b.id

      WHERE
        b.customer_id = $1

        AND LOWER(
          TRIM(
            COALESCE(
              p.payment_status,
              ''
            )
          )
        ) = 'completed'
      `,
      [customerId]
    );


    const totalSpent =
      Number(
        paymentResult.rows[0].total_spent
      ) || 0;


    // =====================================================
    // RECENT BOOKINGS
    // =====================================================

    const bookingsResult = await pool.query(
      `
      SELECT

        b.id,

        b.check_in,

        b.check_out,

        b.adults,

        b.children,

        b.total_amount,

        b.booking_status,

        b.payment_status,

        r.room_number,

        r.room_type,

        r.price_per_night

      FROM bookings b

      INNER JOIN rooms r
        ON b.room_id = r.id

      WHERE
        b.customer_id = $1

      ORDER BY
        b.created_at DESC NULLS LAST

      LIMIT 5
      `,
      [customerId]
    );


    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({

      // ===================================================
      // CUSTOMER
      // ===================================================

      customer,


      // ===================================================
      // STATISTICS
      // ===================================================

      statistics: {

        // Total bookings
        totalBookings:
          Number(
            statistics.total_bookings
          ) || 0,


        // Upcoming bookings
        upcoming:
          Number(
            statistics.upcoming
          ) || 0,


        // Completed bookings
        completed:
          Number(
            statistics.completed
          ) || 0,


        // Confirmed bookings
        confirmed:
          Number(
            statistics.confirmed
          ) || 0,


        // Cancelled bookings
        cancelled:
          Number(
            statistics.cancelled
          ) || 0,


        // Checked-in bookings
        checkedIn:
          Number(
            statistics.checked_in
          ) || 0,


        // Checked-out bookings
        checkedOut:
          Number(
            statistics.checked_out
          ) || 0,


        // Total completed payment amount
        totalSpent,

      },


      // ===================================================
      // RECENT BOOKINGS
      // ===================================================

      recentBookings:
        bookingsResult.rows,

    });


  } catch (error) {

    // =====================================================
    // SERVER ERROR
    // =====================================================

    console.error(
      "========================================"
    );

    console.error(
      "CUSTOMER DASHBOARD ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(error);

    console.error(
      "========================================"
    );


    return res.status(500).json({

      message:
        "Failed to load customer dashboard",

      error:
        error.message,

    });

  }
};