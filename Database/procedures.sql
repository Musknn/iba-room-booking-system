CREATE OR REPLACE PROCEDURE RegisterStudent(
    p_erp         IN User_Table.ERP%TYPE,
    p_name        IN User_Table.name%TYPE,
    p_email       IN User_Table.email%TYPE,
    p_password    IN User_Table.user_password%TYPE,
    p_phonenumber IN User_Table.phone_number%TYPE,
    p_program     IN Student.program%TYPE,
    p_intake_year IN Student.intake_year%TYPE,
    p_success     OUT NUMBER,
    p_message     OUT VARCHAR2
)
AS
    v_erp_exists   NUMBER;
    v_email_exists NUMBER;
    v_phone_exists NUMBER;
BEGIN
    p_success := 0;
    p_message := '';
    
    -- only IBA email allowed
    IF NOT (p_email LIKE '%@khi.iba.edu.pk') THEN
        p_message := 'Only IBA student emails (@khi.iba.edu.pk) allowed';
        RETURN;
    END IF;

    -- ERP must be unique
    SELECT COUNT(*) INTO v_erp_exists
    FROM User_Table
    WHERE erp = p_erp;
    
    IF v_erp_exists > 0 THEN
        p_message := 'ERP number already registered';
        RETURN;
    END IF;

    -- Email must be unique
    SELECT COUNT(*) INTO v_email_exists
    FROM User_Table
    WHERE email = p_email;
    
    IF v_email_exists > 0 THEN
        p_message := 'Email already registered';
        RETURN;
    END IF;

    -- Phone number must be unique
    SELECT COUNT(*) INTO v_phone_exists
    FROM User_Table
    WHERE phone_number = p_phonenumber;
    
    IF v_phone_exists > 0 THEN
        p_message := 'Phone number already registered';
        RETURN;
    END IF;

    -- DIRECT REGISTRATION (NO OTP)
    INSERT INTO User_Table (
        name, email, erp, phone_number, role, user_password
    ) VALUES (
        p_name, p_email, p_erp, p_phonenumber, 'Student', p_password
    );

    INSERT INTO Student (
        erp, program, intake_year
    ) VALUES (
        p_erp,
        p_program,
        p_intake_year
    );

    COMMIT;

    p_success := 1;
    p_message := 'Student registered successfully';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Registration failed: ' || SQLERRM;
END RegisterStudent;
/

CREATE OR REPLACE PROCEDURE StudentLogin(
    p_identifier  IN VARCHAR2,  -- Can be email OR phone
    p_password    IN VARCHAR2,
    p_success     OUT NUMBER,
    p_erp         OUT NUMBER,
    p_name        OUT VARCHAR2,
    p_program     OUT VARCHAR2,
    p_intake_year OUT NUMBER,
    p_message     OUT VARCHAR2
)
AS
    v_is_email BOOLEAN;
BEGIN
    p_success := 0;
    p_erp := NULL;
    p_name := NULL;
    p_program := NULL;
    p_intake_year := NULL;
    p_message := '';
    
    v_is_email := INSTR(p_identifier, '@') > 0;
    
    IF v_is_email THEN
        BEGIN
            SELECT u.erp, u.name, s.program, s.intake_year
            INTO p_erp, p_name, p_program, p_intake_year
            FROM User_Table u
            JOIN Student s ON u.ERP = s.ERP
            WHERE u.email = p_identifier
              AND u.user_password = p_password
              AND u.role = 'Student';
            
            p_success := 1;
            p_message := 'Login successful';
            
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_message := 'Invalid email or password';
            WHEN TOO_MANY_ROWS THEN
                p_message := 'System error: Multiple accounts found';
        END;
    ELSE
        BEGIN
            SELECT u.erp, u.name, s.program, s.intake_year
            INTO p_erp, p_name, p_program, p_intake_year
            FROM User_Table u
            JOIN Student s ON u.ERP = s.ERP
            WHERE u.phone_number = p_identifier
              AND u.user_password = p_password
              AND u.role = 'Student';
            
            p_success := 1;
            p_message := 'Login successful';
            
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_message := 'Invalid phone number or password';
            WHEN TOO_MANY_ROWS THEN
                p_message := 'System error: Multiple accounts found';
        END;
    END IF;
    
END StudentLogin;
/

CREATE OR REPLACE PROCEDURE AdminLogin(
    p_identifier IN VARCHAR2,  -- Can be email OR phone
    p_password   IN User_Table.user_password%TYPE,
    p_success    OUT NUMBER,
    p_role       OUT VARCHAR2,
    p_erp        OUT NUMBER,
    p_name       OUT VARCHAR2,
    p_message    OUT VARCHAR2
)
AS
    v_is_email BOOLEAN;
BEGIN

    p_success := 0;
    p_role := NULL;
    p_erp := NULL;
    p_name := NULL;
    p_message := '';
    
    -- Determine identifier type
    v_is_email := INSTR(p_identifier, '@') > 0;
    
    IF v_is_email THEN
        -- Login with email
        BEGIN
            SELECT erp, name, role
            INTO p_erp, p_name, p_role
            FROM User_Table
            WHERE email = p_identifier
              AND user_password = p_password
              AND role IN ('ProgramOffice', 'BuildingIncharge');
            
            p_success := 1;
            p_message := 'Admin login successful';
            
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_message := 'Invalid admin credentials';
        END;
    ELSE
        -- Login with phone
        BEGIN
            SELECT erp, name, role
            INTO p_erp, p_name, p_role
            FROM User_Table
            WHERE phone_number = p_identifier
              AND user_password = p_password
              AND role IN ('ProgramOffice', 'BuildingIncharge');
            
            p_success := 1;
            p_message := 'Admin login successful';
            
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_message := 'Invalid admin credentials';
        END;
    END IF;
    
END AdminLogin;
/

CREATE OR REPLACE PROCEDURE ShowReservationHistoryForStudent(
    p_erp    IN Booking.ERP%TYPE,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
        SELECT 
            b.booking_id,
            b.room_id,
            r.room_name,
            bld.building_name, 
            b.booking_date,
            b.start_time,
            b.end_time,
            b.purpose,
            b.status,
            b.created_date
        FROM Booking b
        JOIN Room r ON b.room_id = r.room_id
        JOIN Building bld ON r.building_id = bld.building_id
        WHERE b.ERP = p_erp
        ORDER BY b.booking_date DESC, b.start_time DESC;
END;
/

CREATE OR REPLACE PROCEDURE CancelBookingByStudent(
    p_booking_id IN Booking.booking_id%TYPE,
    p_erp        IN Booking.ERP%TYPE,
    p_success    OUT NUMBER,
    p_message    OUT VARCHAR2
)
AS
    v_booking_exists NUMBER;
    v_current_status Booking.status%TYPE;
    v_start_datetime TIMESTAMP;
BEGIN
    p_success := 0;
    p_message := '';
    -- First check if booking exists and belongs to student
    SELECT COUNT(*) 
    INTO v_booking_exists
    FROM Booking
    WHERE booking_id = p_booking_id 
      AND ERP = p_erp;
    
    IF v_booking_exists = 0 THEN
        p_message := 'Booking not found or does not belong to you';
        RETURN;
    END IF;
    
    -- Now get booking details separately
    BEGIN
        SELECT status, booking_date + (start_time - TRUNC(start_time))
        INTO v_current_status, v_start_datetime
        FROM Booking
        WHERE booking_id = p_booking_id 
          AND ERP = p_erp;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_message := 'Booking details not found';
            RETURN;
    END;
    
    -- Check status is 'Approved'
    IF v_current_status != 'Approved' THEN
        p_message := 'Only Approved bookings can be cancelled';
        RETURN;
    END IF;
    
    -- Check booking hasn't started
    IF v_start_datetime <= SYSTIMESTAMP THEN
        p_message := 'Cannot cancel booking that has already started';
        RETURN;
    END IF;
    
    -- Cancel the booking
    UPDATE Booking
    SET status = 'Cancelled'
    WHERE booking_id = p_booking_id
      AND ERP = p_erp;
    
    COMMIT;
    p_success := 1;
    p_message := 'Booking cancelled successfully';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error cancelling booking: ' || SQLERRM;
END CancelBookingByStudent;
/

CREATE OR REPLACE PROCEDURE ShowReservationHistoryForPO(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN    
    OPEN p_result FOR
        SELECT 
            b.booking_id,
            b.ERP,
            u.name AS student_name,
            r.room_name,
            bld.building_name,
            b.booking_date,
            b.start_time,
            b.end_time,
            b.purpose,
            b.status,
            b.created_date
        FROM Booking b
        JOIN Room r ON b.room_id = r.room_id
        JOIN Building bld ON r.building_id = bld.building_id
        JOIN User_Table u ON b.ERP = u.ERP
        WHERE r.room_type = 'CLASSROOM'
        ORDER BY b.booking_date DESC, b.start_time DESC;
END;
/

CREATE OR REPLACE PROCEDURE ShowReservationHistoryForBI(
    p_incharge_id IN Incharge.incharge_id%TYPE,
    p_result      OUT SYS_REFCURSOR
)
AS
    v_building_id Building.building_id%TYPE;
BEGIN
    -- Get building assigned to this incharge
    SELECT building_id INTO v_building_id
    FROM Incharge
    WHERE incharge_id = p_incharge_id;
    
    OPEN p_result FOR
        SELECT 
            b.booking_id,
            b.ERP,
            u.name AS student_name,
            r.room_name,
            bld.building_name,
            b.booking_date,
            b.start_time,
            b.end_time,
            b.purpose,
            b.status,
            b.created_date
        FROM Booking b
        JOIN Room r ON b.room_id = r.room_id
        JOIN Building bld ON r.building_id = bld.building_id
        JOIN User_Table u ON b.ERP = u.ERP
        WHERE r.room_type = 'BREAKOUT'
          AND r.building_id = v_building_id
        ORDER BY b.booking_date DESC, b.start_time DESC;
        
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := NULL;
END;
/

CREATE OR REPLACE PROCEDURE RejectBookingByPO(
    p_booking_id IN Booking.booking_id%TYPE,
    p_success    OUT NUMBER,
    p_message    OUT VARCHAR2
)
AS
    v_room_type Room.room_type%TYPE;
    v_status    Booking.status%TYPE;
BEGIN
    p_success := 0;
    p_message := '';
    
    -- Get booking details
    SELECT r.room_type, b.status
    INTO v_room_type, v_status
    FROM Booking b
    JOIN Room r ON b.room_id = r.room_id
    WHERE b.booking_id = p_booking_id;
    
    -- Check it's a classroom
    IF v_room_type != 'CLASSROOM' THEN
        p_message := 'Only classroom bookings can be rejected by PO';
        RETURN;
    END IF;
    
    -- Check status is 'Approved'
    IF v_status != 'Approved' THEN
        p_message := 'Only Approved bookings can be rejected';
        RETURN;
    END IF;
    
    -- Reject the booking
    UPDATE Booking
    SET status = 'Rejected'
    WHERE booking_id = p_booking_id;
    
    COMMIT;
    p_success := 1;
    p_message := 'Booking rejected successfully';
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_message := 'Booking not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_message := 'Error rejecting booking: ' || SQLERRM;
END;
/

CREATE OR REPLACE PROCEDURE RejectBookingByBI(
    p_booking_id  IN Booking.booking_id%TYPE,
    p_incharge_id IN Incharge.incharge_id%TYPE,
    p_success     OUT NUMBER,
    p_message     OUT VARCHAR2
)
AS
    v_room_type   Room.room_type%TYPE;
    v_status      Booking.status%TYPE;
    v_building_id Building.building_id%TYPE;
    v_room_building_id Room.building_id%TYPE;
BEGIN
    p_success := 0;
    p_message := '';
    
    -- Get BI's building
    SELECT building_id INTO v_building_id
    FROM Incharge
    WHERE incharge_id = p_incharge_id;
    
    -- Get booking details
    SELECT r.room_type, b.status, r.building_id
    INTO v_room_type, v_status, v_room_building_id
    FROM Booking b
    JOIN Room r ON b.room_id = r.room_id
    WHERE b.booking_id = p_booking_id;
    
    -- Check it's a breakout in BI's building
    IF v_room_type != 'BREAKOUT' THEN
        p_message := 'Only breakout bookings can be rejected by BI';
        RETURN;
    END IF;
    
    IF v_room_building_id != v_building_id THEN
        p_message := 'Cannot reject bookings from other buildings';
        RETURN;
    END IF;
    
    -- Check status is 'Approved'
    IF v_status != 'Approved' THEN
        p_message := 'Only Approved bookings can be rejected';
        RETURN;
    END IF;
    
    -- Reject the booking
    UPDATE Booking
    SET status = 'Rejected'
    WHERE booking_id = p_booking_id;
    
    COMMIT;
    
    p_success := 1;
    p_message := 'Booking rejected successfully';
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_message := 'Booking not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_message := 'Error rejecting booking: ' || SQLERRM;
END;
/


CREATE OR REPLACE PROCEDURE PostAnnouncement(
    p_erp          IN Announcement.ERP%TYPE,
    p_title        IN Announcement.title%TYPE,
    p_description  IN Announcement.description%TYPE,
    p_success      OUT NUMBER,
    p_message      OUT VARCHAR2
)
AS
    v_role User_Table.role%TYPE;
    v_incharge_exists NUMBER;
BEGIN   
    p_success := 0;
    p_message := '';
    
    -- Check user is BuildingIncharge
    SELECT role INTO v_role
    FROM User_Table
    WHERE ERP = p_erp;
    
    IF v_role != 'BuildingIncharge' THEN
        p_message := 'Only Building Incharges can post announcements';
        RETURN;
    END IF;
    
    -- Check incharge is assigned to a building
    SELECT COUNT(*) INTO v_incharge_exists
    FROM Incharge
    WHERE incharge_id = p_erp;
    
    IF v_incharge_exists = 0 THEN
        p_message := 'Building Incharge not assigned to any building';
        RETURN;
    END IF;
    
    -- Insert announcement
    INSERT INTO Announcement (
        ERP, title, description, date_posted
    ) VALUES (
        p_erp, p_title, p_description, SYSTIMESTAMP
    );
    
    COMMIT;
    
    p_success := 1;
    p_message := 'Announcement posted successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error posting announcement: ' || SQLERRM;
END;
/

CREATE OR REPLACE PROCEDURE DeleteAnnouncement(
    p_announcement_id IN Announcement.announcement_id%TYPE,
    p_erp             IN Announcement.ERP%TYPE,
    p_success         OUT NUMBER,
    p_message         OUT VARCHAR2
)
AS
    v_announcement_exists NUMBER;
BEGIN
    p_success := 0;
    p_message := '';
    
    -- Check announcement exists and belongs to user
    SELECT COUNT(*) INTO v_announcement_exists
    FROM Announcement
    WHERE announcement_id = p_announcement_id
      AND ERP = p_erp;
    
    IF v_announcement_exists = 0 THEN
        p_message := 'Announcement not found or you do not have permission';
        RETURN;
    END IF;
    
    -- Delete announcement
    DELETE FROM Announcement
    WHERE announcement_id = p_announcement_id
      AND ERP = p_erp;
    
    COMMIT;
    
    p_success := 1;
    p_message := 'Announcement deleted successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error deleting announcement: ' || SQLERRM;
END;
/

CREATE OR REPLACE PROCEDURE ShowAnnouncementsByUser(
    p_erp     IN Announcement.ERP%TYPE,
    p_result  OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
        SELECT 
            announcement_id,
            title,
            description,
            date_posted,
            created_date
        FROM Announcement
        WHERE ERP = p_erp
        ORDER BY date_posted DESC;
END;
/

CREATE OR REPLACE PROCEDURE ShowAllAnnouncements(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN    
    OPEN p_result FOR
        SELECT 
            a.announcement_id,
            a.title,
            a.description,
            a.date_posted,
            u.name AS posted_by,
            b.building_name
        FROM Announcement a
        JOIN User_Table u ON a.ERP = u.ERP
        LEFT JOIN Incharge i ON a.ERP = i.incharge_id
        LEFT JOIN Building b ON i.building_id = b.building_id
        ORDER BY a.date_posted DESC;
END;
/

CREATE OR REPLACE PROCEDURE FilterAnnouncementsByBuilding(
    p_building_name IN Building.building_name%TYPE,
    p_result      OUT SYS_REFCURSOR
)
AS
    v_building_exists NUMBER;
BEGIN
    -- Check building exists
    SELECT COUNT(*) INTO v_building_exists
    FROM Building
    WHERE UPPER(building_name) = UPPER(p_building_name);
    
    IF v_building_exists = 0 THEN
        p_result := NULL;
        RETURN;
    END IF;
    
    OPEN p_result FOR
        SELECT 
            a.announcement_id,
            a.title,
            a.description,
            a.date_posted,
            u.name AS posted_by,
            b.building_name
        FROM Announcement a
        JOIN User_Table u ON a.ERP = u.ERP
        JOIN Incharge i ON a.ERP = i.incharge_id
        JOIN Building b ON i.building_id = b.building_id
        WHERE UPPER(b.building_name) = UPPER(p_building_name) 
        ORDER BY a.date_posted DESC;
        
END;
/

-- ============================================
-- BUILDING MANAGEMENT PROCEDURES
-- ============================================

CREATE OR REPLACE PROCEDURE add_building(
    p_building_name IN Building.building_name%TYPE,
    p_incharge_erp IN User_Table.ERP%TYPE,
    p_incharge_name IN User_Table.name%TYPE,
    p_incharge_email IN User_Table.email%TYPE,
    p_phonenumber IN User_Table.phone_number%TYPE,
    p_result OUT VARCHAR2
)
AS
    v_building_count NUMBER;
    v_building_id Building.building_id%TYPE;
    v_user_count NUMBER;
    v_incharge_count NUMBER;
BEGIN
    -- Step 1: Check if building already exists by name
    SELECT COUNT(*) INTO v_building_count 
    FROM Building 
    WHERE UPPER(building_name) = UPPER(p_building_name);
    
    -- If building exists, return error message
    IF v_building_count > 0 THEN
        p_result := 'Building "' || p_building_name || '" already exists';
        RETURN;
    END IF;

    -- only IBA email allowed
    IF NOT (p_incharge_email LIKE '%@iba.edu.pk') THEN
        p_result := 'Only IBA incharge emails (@iba.edu.pk) allowed';
        RETURN;
    END IF;
    
    -- Step 2: Check if incharge ERP exists in User_Table
    SELECT COUNT(*) INTO v_user_count 
    FROM User_Table 
    WHERE ERP = p_incharge_erp;
    
    -- Step 3: Check if incharge is already assigned to another building
    SELECT COUNT(*) INTO v_incharge_count
    FROM Incharge
    WHERE incharge_id = p_incharge_erp;
    
    -- If incharge is already assigned to another building, return error
    IF v_incharge_count > 0 THEN
        p_result := 'Incharge with ERP ' || p_incharge_erp || ' is already assigned to another building';
        RETURN;
    END IF;
    
    -- Step 4: If incharge doesn't exist in User_Table, add them
    IF v_user_count = 0 THEN
        INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number)
        VALUES (p_incharge_erp, p_incharge_name, p_incharge_email, 'default_password', 'BuildingIncharge', p_phonenumber);
    END IF;
    
    -- Step 5: Insert the new building (ID will auto-generate)
    INSERT INTO Building (building_name)
    VALUES (p_building_name)
    RETURNING building_id INTO v_building_id;
    
    -- Step 6: Assign incharge to the building
    INSERT INTO Incharge (incharge_id, building_id)
    VALUES (p_incharge_erp, v_building_id);
    
    -- Step 7: Set success message with building ID
    p_result := 'Building "' || p_building_name || '" added successfully with ID: ' || v_building_id || '. Incharge assigned.';
    
    -- Commit the transaction
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Handle any exceptions and return error message
        p_result := 'Error adding building: ' || SQLERRM;
        ROLLBACK;
END add_building;
/

CREATE OR REPLACE PROCEDURE add_room(
    p_building_name IN Building.building_name%TYPE,
    p_room_name IN Room.room_name%TYPE,
    p_room_type IN Room.room_type%TYPE,
    p_result OUT VARCHAR2
)
AS
    v_building_count NUMBER;
    v_room_count NUMBER;
    v_building_id Building.building_id%TYPE;
    v_room_id Room.room_id%TYPE;
BEGIN
    -- Step 1: Check if building exists
    BEGIN
        SELECT building_id INTO v_building_id
        FROM Building 
        WHERE UPPER(building_name) = UPPER(p_building_name);
        
        v_building_count := 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_building_count := 0;
    END;
    
    -- If building doesn't exist, return error message
    IF v_building_count = 0 THEN
        p_result := 'Building "' || p_building_name || '" does not exist. Please add building first.';
        RETURN;
    END IF;
    
    -- Step 2: Check if room already exists in this building
    SELECT COUNT(*) INTO v_room_count 
    FROM Room 
    WHERE UPPER(room_name) = UPPER(p_room_name)
    AND building_id = v_building_id;
    
    -- If room exists, return error message
    IF v_room_count > 0 THEN
        p_result := 'Room "' || p_room_name || '" already exists in building "' || p_building_name || '"';
        RETURN;
    END IF;
    
    -- Step 3: Insert the new room (ID will auto-generate)
    INSERT INTO Room (building_id, room_name, room_type)
    VALUES (v_building_id, p_room_name, p_room_type)
    RETURNING room_id INTO v_room_id;
    
    -- Step 4: Set success message
    p_result := 'Room "' || p_room_name || '" added successfully to building "' || p_building_name || '" with ID: ' || v_room_id;
    
    -- Commit the transaction
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Handle any exceptions and return error message
        p_result := 'Error adding room: ' || SQLERRM;
        ROLLBACK;
END add_room;
/

CREATE OR REPLACE PROCEDURE get_buildings(
    p_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_cursor FOR
    SELECT building_id, building_name 
    FROM Building 
    ORDER BY building_name;
END get_buildings;
/

-- ============================================
-- BOOKING MANAGEMENT PROCEDURES
-- ============================================

CREATE OR REPLACE PROCEDURE get_available_rooms(
    p_date IN DATE,
    p_start_time IN VARCHAR2,
    p_end_time IN VARCHAR2,
    p_building_id IN NUMBER,
    p_room_type IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
)
AS
    v_start_datetime TIMESTAMP;  -- Changed from DATE to TIMESTAMP to match your schema
    v_end_datetime TIMESTAMP;    -- Changed from DATE to TIMESTAMP to match your schema
    v_day_of_week VARCHAR2(10);  -- Changed to match your Schedule.day_of_week
BEGIN
    -- Convert time strings to datetime
    v_start_datetime := TO_TIMESTAMP(TO_CHAR(p_date, 'YYYY-MM-DD') || ' ' || p_start_time, 'YYYY-MM-DD HH24:MI');
    v_end_datetime := TO_TIMESTAMP(TO_CHAR(p_date, 'YYYY-MM-DD') || ' ' || p_end_time, 'YYYY-MM-DD HH24:MI');
    v_day_of_week := UPPER(TO_CHAR(p_date, 'DAY'));  -- Get day of week
    
    OPEN p_cursor FOR
    SELECT 
        r.room_id,
        r.room_name,
        r.room_type,
        b.building_name,
        b.building_id
    FROM Room r
    JOIN Building b ON r.building_id = b.building_id
    WHERE b.building_id = p_building_id
    AND r.room_type = p_room_type
    AND r.room_id NOT IN (
        -- Rooms already booked for this time slot (only approved bookings block availability)
        SELECT room_id FROM Booking
        WHERE booking_date = p_date  -- Changed from date_of_booking to booking_date
        AND status = 'Approved'  -- Changed to match your schema (capitalized)
        AND NOT (
            end_time <= v_start_datetime OR 
            start_time >= v_end_datetime
        )
    )
    AND r.room_id NOT IN (
        -- Rooms scheduled for classes
        SELECT room_id FROM Schedule
        WHERE day_of_week = v_day_of_week  -- Changed from day to day_of_week
        AND NOT (
            end_time <= v_start_datetime OR 
            start_time >= v_end_datetime
        )
    )
    ORDER BY r.room_name;
END get_available_rooms;
/

CREATE OR REPLACE PROCEDURE create_booking(
    p_erp IN NUMBER,
    p_room_id IN NUMBER,
    p_date_of_booking IN DATE,
    p_start_time IN VARCHAR2,
    p_end_time IN VARCHAR2,
    p_purpose IN VARCHAR2,
    p_booking_id OUT NUMBER,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
)
AS
    v_start_datetime TIMESTAMP; 
    v_end_datetime TIMESTAMP;    
    v_conflict_count NUMBER;
    v_schedule_count NUMBER;
    v_current_date DATE := SYSDATE;
    v_day_of_week VARCHAR2(10);  
BEGIN
    p_success := 0;
    p_message := 'Booking failed';
    
    IF TRUNC(p_date_of_booking) < TRUNC(v_current_date) THEN
        p_message := 'Booking date cannot be in the past. Please select today or a future date.';
        RETURN;
    END IF;
    
    v_start_datetime := TO_TIMESTAMP(TO_CHAR(p_date_of_booking, 'YYYY-MM-DD') || ' ' || p_start_time, 'YYYY-MM-DD HH24:MI');
    v_end_datetime := TO_TIMESTAMP(TO_CHAR(p_date_of_booking, 'YYYY-MM-DD') || ' ' || p_end_time, 'YYYY-MM-DD HH24:MI');
    v_day_of_week := UPPER(TO_CHAR(p_date_of_booking, 'DAY'));  -- Get day of week
    
    -- If booking is for today, validate that start time is not in the past
    IF TRUNC(p_date_of_booking) = TRUNC(v_current_date) THEN
        IF v_start_datetime < SYSTIMESTAMP THEN  
            p_message := 'Start time cannot be in the past for today''s booking.';
            RETURN;
        END IF;
    END IF;
    
    -- Validate end time is after start time
    IF v_end_datetime <= v_start_datetime THEN
        p_message := 'End time must be after start time.';
        RETURN;
    END IF;
    
    -- Check for booking conflicts (only check approved bookings)
    SELECT COUNT(*) INTO v_conflict_count
    FROM Booking
    WHERE room_id = p_room_id
    AND booking_date = p_date_of_booking  
    AND status = 'Approved'  
    AND NOT (
        end_time <= v_start_datetime OR 
        start_time >= v_end_datetime
    );
    
    -- Check for schedule conflicts
    SELECT COUNT(*) INTO v_schedule_count
    FROM Schedule
    WHERE room_id = p_room_id
    AND day_of_week = v_day_of_week  -- Changed from day
    AND NOT (
        end_time <= v_start_datetime OR 
        start_time >= v_end_datetime
    );
    
    IF v_conflict_count > 0 THEN
        p_message := 'Room already booked for this time slot';
        RETURN;
    END IF;
    
    IF v_schedule_count > 0 THEN
        p_message := 'Room is scheduled for classes during this time';
        RETURN;
    END IF;

    INSERT INTO Booking (
        ERP, room_id, booking_date,  -- Changed from date_of_booking
        start_time, end_time, purpose, status
    ) VALUES (
        p_erp, p_room_id, p_date_of_booking,
        v_start_datetime, v_end_datetime, p_purpose, 'Approved'
    )
    RETURNING booking_id INTO p_booking_id;
    
    COMMIT;
    p_success := 1;
    p_message := 'Booking approved successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_message := 'Error creating booking: ' || SQLERRM;
        p_success := 0;
END create_booking;
/

CREATE OR REPLACE PROCEDURE ViewAllRooms(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
        SELECT 
            r.room_id,
            r.room_name,
            r.room_type,
            b.building_id,
            b.building_name
        FROM Room r
        JOIN Building b ON r.building_id = b.building_id
        ORDER BY b.building_name, r.room_type, r.room_name;
    
END ViewAllRooms;
/

CREATE OR REPLACE PROCEDURE GetRoomsByBuilding(
    p_building_name IN Building.building_name%TYPE,
    p_result        OUT SYS_REFCURSOR
)
AS
    v_building_exists NUMBER;
BEGIN
    
    -- Check if building exists
    SELECT COUNT(*) INTO v_building_exists
    FROM Building
    WHERE UPPER(building_name) = UPPER(p_building_name);
    
    IF v_building_exists = 0 THEN
        -- Return empty cursor if building doesn't exist
        OPEN p_result FOR
            SELECT 
                r.room_id,
                r.room_name,
                r.room_type,
                b.building_id,
                b.building_name
            FROM Room r
            JOIN Building b ON r.building_id = b.building_id
            WHERE 1 = 0; -- Always false
        RETURN;
    END IF;
    
    -- Get all rooms in the specified building
    OPEN p_result FOR
        SELECT 
            r.room_id,
            r.room_name,
            r.room_type,
            b.building_id,
            b.building_name
        FROM Room r
        JOIN Building b ON r.building_id = b.building_id
        WHERE UPPER(b.building_name) = UPPER(p_building_name)
        ORDER BY r.room_type, r.room_name;
    
END GetRoomsByBuilding;
/

CREATE OR REPLACE PROCEDURE SearchRoomsByName(
    p_search_term IN VARCHAR2,
    p_result      OUT SYS_REFCURSOR
)
AS
BEGIN
    IF p_search_term IS NULL OR LENGTH(TRIM(p_search_term)) = 0 THEN
        -- If search term is empty, return all rooms
        OPEN p_result FOR
            SELECT 
                r.room_id,
                r.room_name,
                r.room_type,
                b.building_id,
                b.building_name
            FROM Room r
            JOIN Building b ON r.building_id = b.building_id
            ORDER BY b.building_name, r.room_name;
    ELSE
        -- Search for rooms with partial match in room_name
        OPEN p_result FOR
            SELECT 
                r.room_id,
                r.room_name,
                r.room_type,
                b.building_id,
                b.building_name
            FROM Room r
            JOIN Building b ON r.building_id = b.building_id
            WHERE UPPER(r.room_name) LIKE '%' || UPPER(TRIM(p_search_term)) || '%'
            ORDER BY b.building_name, r.room_name;
    END IF;
    
END SearchRoomsByName;
/

CREATE OR REPLACE PROCEDURE RejectBooking(
    p_booking_id  IN Booking.booking_id%TYPE,
    p_role        IN VARCHAR2,
    p_user_erp    IN NUMBER DEFAULT NULL,  -- For BI verification
    p_success     OUT NUMBER,
    p_message     OUT VARCHAR2
)
AS
    v_room_type   Room.room_type%TYPE;
    v_status      Booking.status%TYPE;
    v_building_id Building.building_id%TYPE;
    v_room_building_id Room.building_id%TYPE;
BEGIN
    p_success := 0;
    p_message := '';
    
    -- Get booking details
    BEGIN
        SELECT r.room_type, b.status, r.building_id
        INTO v_room_type, v_status, v_room_building_id
        FROM Booking b
        JOIN Room r ON b.room_id = r.room_id
        WHERE b.booking_id = p_booking_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_message := 'Booking not found';
            RETURN;
    END;
    
    -- Check status is 'Approved'
    IF v_status != 'Approved' THEN
        p_message := 'Only Approved bookings can be rejected';
        RETURN;
    END IF;
    
    IF p_role = 'ProgramOffice' THEN
        -- PO can only reject classrooms
        IF v_room_type != 'CLASSROOM' THEN
            p_message := 'Only classroom bookings can be rejected by Program Office';
            RETURN;
        END IF;
        
    ELSIF p_role = 'BuildingIncharge' THEN
        -- BI can only reject breakouts in their building
        IF v_room_type != 'BREAKOUT' THEN
            p_message := 'Only breakout room bookings can be rejected by Building Incharge';
            RETURN;
        END IF;
        
        -- Verify BI is incharge of this building
        IF p_user_erp IS NULL THEN
            p_message := 'Building Incharge ERP required';
            RETURN;
        END IF;
        
        BEGIN
            SELECT building_id INTO v_building_id
            FROM Incharge
            WHERE incharge_id = p_user_erp;
            
            IF v_room_building_id != v_building_id THEN
                p_message := 'Cannot reject bookings from other buildings';
                RETURN;
            END IF;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_message := 'Building Incharge not found or not assigned to a building';
                RETURN;
        END;
        
    ELSE
        p_message := 'Invalid role. Only ProgramOffice or BuildingIncharge can reject bookings';
        RETURN;
    END IF;
    
    -- Reject the booking
    UPDATE Booking
    SET status = 'Rejected'
    WHERE booking_id = p_booking_id;
    
    COMMIT;
    
    p_success := 1;
    p_message := 'Booking rejected successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Error rejecting booking: ' || SQLERRM;
END RejectBooking;
/