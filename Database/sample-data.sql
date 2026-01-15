-- 2. Enable output
SET SERVEROUTPUT ON;

-- ============================================
-- 3. INSERT BUILDINGS 
-- ============================================
INSERT INTO Building (building_name) VALUES ('Adamjee');
INSERT INTO Building (building_name) VALUES ('Aman CED');
INSERT INTO Building (building_name) VALUES ('Tabba');
INSERT INTO Building (building_name) VALUES ('Executive Center');
INSERT INTO Building (building_name) VALUES ('Sports Complex');

COMMIT;

-- ============================================
-- 4. INSERT USERS WITH PROPER 8+ CHARACTER PASSWORDS
-- ============================================
-- Students
INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (10001, 'Muskan Ahmed', 'muskan@khi.iba.edu.pk', 'muskan1234', 'Student', '03123456701');

INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (10002, 'Kashish Khan', 'kashish@khi.iba.edu.pk', 'kashish1234', 'Student', '03123456702');

INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (10003, 'Mustafa Ali', 'mustafa@khi.iba.edu.pk', 'mustafa1234', 'Student', '03123456703');

INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (10004, 'Hiba Raza', 'hiba@khi.iba.edu.pk', 'hibaraza123', 'Student', '03123456704');

-- Students
INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (10005, 'Abdullah Malik', 'abdullah@khi.iba.edu.pk', 'abdullah1234', 'Student', '03123456705');

-- Program Office
INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (20001, 'Ahsan Raza', 'ahsan@iba.edu.pk', 'Program1234', 'ProgramOffice', '03123456706');

-- Building Incharges
INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (30001, 'Mohsin Khan', 'mohsin@iba.edu.pk', 'Building1234', 'BuildingIncharge', '03123456707');

INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (30002, 'Taimoor Ahmed', 'taimoor@iba.edu.pk', 'Building1234', 'BuildingIncharge', '03123456708');

INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (30003, 'Zaid Hassan', 'zaid@iba.edu.pk', 'Building1234', 'BuildingIncharge', '03123456709');

INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (30004, 'Samreen Ali', 'samreen@iba.edu.pk', 'Building1234', 'BuildingIncharge', '03123456710');

INSERT INTO User_Table (ERP, name, email, user_password, role, phone_number) 
VALUES (30005, 'Maheen Shah', 'maheen@iba.edu.pk', 'Building1234', 'BuildingIncharge', '03123456711');

COMMIT;

-- ============================================
-- 5. INSERT STUDENT ACADEMIC INFO
-- ============================================
INSERT INTO Student (ERP, program, intake_year) VALUES (10001, 'BSCS', 2023);
INSERT INTO Student (ERP, program, intake_year) VALUES (10002, 'BSCS', 2023);
INSERT INTO Student (ERP, program, intake_year) VALUES (10003, 'BSMT', 2024);
INSERT INTO Student (ERP, program, intake_year) VALUES (10004, 'BBA', 2024);
INSERT INTO Student (ERP, program, intake_year) VALUES (10005, 'BSECO', 2025);

COMMIT;

-- ============================================
-- 6. INSERT ROOMS - FIRST CHECK BUILDING IDs
-- ============================================
DECLARE
    v_adamjee_id NUMBER;
    v_aman_id NUMBER;
    v_tabba_id NUMBER;
    v_exec_id NUMBER;
    v_sports_id NUMBER;
BEGIN
    -- Get actual building IDs
    SELECT building_id INTO v_adamjee_id FROM Building WHERE building_name = 'Adamjee';
    SELECT building_id INTO v_aman_id FROM Building WHERE building_name = 'Aman CED';
    SELECT building_id INTO v_tabba_id FROM Building WHERE building_name = 'Tabba';
    SELECT building_id INTO v_exec_id FROM Building WHERE building_name = 'Executive Center';
    SELECT building_id INTO v_sports_id FROM Building WHERE building_name = 'Sports Complex';
    
    DBMS_OUTPUT.PUT_LINE('Building IDs: Adamjee=' || v_adamjee_id || 
                        ', Aman CED=' || v_aman_id || 
                        ', Tabba=' || v_tabba_id ||
                        ', Exec Center=' || v_exec_id ||
                        ', Sports=' || v_sports_id);
    
    -- Adamjee Building
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'AUDITORIUM', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'EVENT HALL', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-1', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-2', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-3', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-4', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-5', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-6', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-7', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'MAC-8', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'BREAKOUT-1', 'BREAKOUT');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_adamjee_id, 'BREAKOUT-2', 'BREAKOUT');

    -- Aman CED Building
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MCC-9', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MCC-10', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MCC-11', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MCC-12', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MCC-13', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MCC-14', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MC-BREAKOUT-1', 'BREAKOUT');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_aman_id, 'MC-BREAKOUT-2', 'BREAKOUT');

    -- Tabba Building
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_tabba_id, 'MTC-16', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_tabba_id, 'MTC-17', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_tabba_id, 'MTC-18', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_tabba_id, 'MTC-19', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_tabba_id, 'MT-BREAKOUT-1', 'BREAKOUT');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_tabba_id, 'MT-BREAKOUT-2', 'BREAKOUT');

    -- Executive Center
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_exec_id, 'EC-CONF-1', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_exec_id, 'EC-CONF-2', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_exec_id, 'EC-BOARD-ROOM', 'CLASSROOM');

    -- Sports Complex
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_sports_id, 'GYM', 'CLASSROOM');
    INSERT INTO Room (building_id, room_name, room_type) VALUES (v_sports_id, 'SPORTS-HALL', 'CLASSROOM');
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('30+ rooms inserted.');
    
    -- Store these IDs for later use in other procedures
    DBMS_OUTPUT.PUT_LINE('Stored building IDs for later use.');
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Could not find one or more buildings. Check Building table.');
        ROLLBACK;
        RAISE;
END;
/
-- ============================================
-- 7. ASSIGN BUILDING INCHARGES - UPDATED WITH VARIABLES
-- ============================================
DECLARE
    v_adamjee_id NUMBER;
    v_aman_id NUMBER;
    v_tabba_id NUMBER;
    v_exec_id NUMBER;
    v_sports_id NUMBER;
BEGIN
    -- Get building IDs again (or you could store them in a package variable)
    SELECT building_id INTO v_adamjee_id FROM Building WHERE building_name = 'Adamjee';
    SELECT building_id INTO v_aman_id FROM Building WHERE building_name = 'Aman CED';
    SELECT building_id INTO v_tabba_id FROM Building WHERE building_name = 'Tabba';
    SELECT building_id INTO v_exec_id FROM Building WHERE building_name = 'Executive Center';
    SELECT building_id INTO v_sports_id FROM Building WHERE building_name = 'Sports Complex';
    -- Zaid (30003) for Adamjee
    INSERT INTO Incharge (incharge_id, building_id) VALUES (30003, v_adamjee_id);
    -- Taimoor (30002) for Aman CED
    INSERT INTO Incharge (incharge_id, building_id) VALUES (30002, v_aman_id);
    -- Mohsin (30001) for Tabba
    INSERT INTO Incharge (incharge_id, building_id) VALUES (30001, v_tabba_id);
    -- Maheen (30005) for Executive Center
    INSERT INTO Incharge (incharge_id, building_id) VALUES (30005, v_exec_id);
    -- Samreen (30004) for Sports Complex
    INSERT INTO Incharge (incharge_id, building_id) VALUES (30004, v_sports_id);
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('5 building incharges assigned.');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Could not find buildings or incharges.');
        ROLLBACK;
        RAISE;
END;
/

-- ============================================
-- 8. INSERT SCHEDULE - NEED TO GET ROOM IDs DYNAMICALLY
-- ============================================
DECLARE
    v_auditorium_id NUMBER;
    v_mac1_id NUMBER;
    v_mcc9_id NUMBER;
    v_mtc16_id NUMBER;
    v_gym_id NUMBER;
BEGIN
    -- Get room IDs based on room names and buildings
    -- Adamjee Auditorium
    SELECT r.room_id INTO v_auditorium_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'AUDITORIUM' AND b.building_name = 'Adamjee';
    
    -- Adamjee MAC-1
    SELECT r.room_id INTO v_mac1_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'MAC-1' AND b.building_name = 'Adamjee';
    
    -- Aman CED MCC-9
    SELECT r.room_id INTO v_mcc9_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'MCC-9' AND b.building_name = 'Aman CED';
    
    -- Tabba MTC-16
    SELECT r.room_id INTO v_mtc16_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'MTC-16' AND b.building_name = 'Tabba';
    
    -- Sports Complex GYM
    SELECT r.room_id INTO v_gym_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'GYM' AND b.building_name = 'Sports Complex';
    
    DBMS_OUTPUT.PUT_LINE('Room IDs: Auditorium=' || v_auditorium_id || 
                        ', MAC-1=' || v_mac1_id || 
                        ', MCC-9=' || v_mcc9_id ||
                        ', MTC-16=' || v_mtc16_id ||
                        ', GYM=' || v_gym_id);
    
    -- Monday classes
    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_auditorium_id, 'MONDAY', TO_TIMESTAMP('1970-01-01 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'CS401');

    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_mac1_id, 'MONDAY', TO_TIMESTAMP('1970-01-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 11:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'MT301');

    -- Tuesday classes
    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_mcc9_id, 'TUESDAY', TO_TIMESTAMP('1970-01-01 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'FIN401');

    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_mtc16_id, 'TUESDAY', TO_TIMESTAMP('1970-01-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 11:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'MGT501');

    -- Wednesday classes
    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_auditorium_id, 'WEDNESDAY', TO_TIMESTAMP('1970-01-01 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'CS401');

    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_mac1_id, 'WEDNESDAY', TO_TIMESTAMP('1970-01-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 11:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'MT301');

    -- Thursday classes
    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_mcc9_id, 'THURSDAY', TO_TIMESTAMP('1970-01-01 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'FIN401');

    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_mtc16_id, 'THURSDAY', TO_TIMESTAMP('1970-01-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 11:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'MGT501');

    -- Friday classes
    INSERT INTO Schedule (room_id, day_of_week, start_time, end_time, course_code) 
    VALUES (v_gym_id, 'FRIDAY', TO_TIMESTAMP('1970-01-01 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 
            TO_TIMESTAMP('1970-01-01 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'PE101');

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Schedule data inserted.');
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Could not find one or more rooms.');
        ROLLBACK;
        RAISE;
END;
/

-- ============================================
-- 9. INSERT SAMPLE BOOKINGS - UPDATED TO GET ROOM IDs DYNAMICALLY
-- ============================================
DECLARE
    v_today DATE := TRUNC(SYSDATE);
    v_next_monday DATE;
    v_next_tuesday DATE;
    v_next_wednesday DATE;
    v_next_thursday DATE;
    v_next_friday DATE;
    
    v_breakout1_id NUMBER;
    v_mc_breakout1_id NUMBER;
    v_mt_breakout1_id NUMBER;
    v_auditorium_id NUMBER;
    v_event_hall_id NUMBER;
    v_breakout2_id NUMBER;
    v_mc_breakout2_id NUMBER;
BEGIN
    -- Calculate next week's dates
    v_next_monday := v_today + MOD(8 - TO_CHAR(v_today, 'D'), 7); -- Next Monday
    v_next_tuesday := v_next_monday + 1;
    v_next_wednesday := v_next_monday + 2;
    v_next_thursday := v_next_monday + 3;
    v_next_friday := v_next_monday + 4;
    
    -- Get room IDs dynamically
    -- Adamjee BREAKOUT-1
    SELECT r.room_id INTO v_breakout1_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'BREAKOUT-1' AND b.building_name = 'Adamjee';
    
    -- Aman CED MC-BREAKOUT-1
    SELECT r.room_id INTO v_mc_breakout1_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'MC-BREAKOUT-1' AND b.building_name = 'Aman CED';
    
    -- Tabba MT-BREAKOUT-1
    SELECT r.room_id INTO v_mt_breakout1_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'MT-BREAKOUT-1' AND b.building_name = 'Tabba';
    
    -- Adamjee AUDITORIUM
    SELECT r.room_id INTO v_auditorium_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'AUDITORIUM' AND b.building_name = 'Adamjee';
    
    -- Adamjee EVENT HALL
    SELECT r.room_id INTO v_event_hall_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'EVENT HALL' AND b.building_name = 'Adamjee';
    
    -- Adamjee BREAKOUT-2
    SELECT r.room_id INTO v_breakout2_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'BREAKOUT-2' AND b.building_name = 'Adamjee';
    
    -- Aman CED MC-BREAKOUT-2
    SELECT r.room_id INTO v_mc_breakout2_id 
    FROM Room r 
    JOIN Building b ON r.building_id = b.building_id
    WHERE r.room_name = 'MC-BREAKOUT-2' AND b.building_name = 'Aman CED';
    
    DBMS_OUTPUT.PUT_LINE('Room IDs: BREAKOUT-1=' || v_breakout1_id || 
                        ', MC-BREAKOUT-1=' || v_mc_breakout1_id ||
                        ', MT-BREAKOUT-1=' || v_mt_breakout1_id);
    
    -- Muskan's booking (next Monday 10:00 AM)
    INSERT INTO Booking (ERP, room_id, booking_date, start_time, end_time, purpose, status) 
    VALUES (10001, v_breakout1_id, v_next_monday,
            TO_TIMESTAMP(TO_CHAR(v_next_monday, 'YYYY-MM-DD') || ' 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(TO_CHAR(v_next_monday, 'YYYY-MM-DD') || ' 11:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            'Group study session for CS401', 'Approved');
    
    -- Kashish's booking (next Tuesday 2:00 PM)
    INSERT INTO Booking (ERP, room_id, booking_date, start_time, end_time, purpose, status) 
    VALUES (10002, v_mc_breakout1_id, v_next_tuesday,
            TO_TIMESTAMP(TO_CHAR(v_next_tuesday, 'YYYY-MM-DD') || ' 14:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(TO_CHAR(v_next_tuesday, 'YYYY-MM-DD') || ' 15:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            'Project meeting with team', 'Approved');
    
    -- Mustafa's booking (next Wednesday 9:00 AM)
    INSERT INTO Booking (ERP, room_id, booking_date, start_time, end_time, purpose, status) 
    VALUES (10003, v_mt_breakout1_id, v_next_wednesday,
            TO_TIMESTAMP(TO_CHAR(v_next_wednesday, 'YYYY-MM-DD') || ' 09:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(TO_CHAR(v_next_wednesday, 'YYYY-MM-DD') || ' 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            'Presentation practice', 'Approved');
    
    -- Hiba's booking (next Thursday 1:00 PM)
    INSERT INTO Booking (ERP, room_id, booking_date, start_time, end_time, purpose, status) 
    VALUES (10004, v_auditorium_id, v_next_thursday,
            TO_TIMESTAMP(TO_CHAR(v_next_thursday, 'YYYY-MM-DD') || ' 13:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(TO_CHAR(v_next_thursday, 'YYYY-MM-DD') || ' 14:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            'Research discussion', 'Approved');
    
    -- Abdullah's booking (next Friday 11:00 AM)
    INSERT INTO Booking (ERP, room_id, booking_date, start_time, end_time, purpose, status) 
    VALUES (10005, v_event_hall_id, v_next_friday,
            TO_TIMESTAMP(TO_CHAR(v_next_friday, 'YYYY-MM-DD') || ' 11:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(TO_CHAR(v_next_friday, 'YYYY-MM-DD') || ' 12:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            'Study group for Economics', 'Approved');
    
    -- Add a cancelled booking
    INSERT INTO Booking (ERP, room_id, booking_date, start_time, end_time, purpose, status) 
    VALUES (10002, v_breakout2_id, v_next_monday + 7,
            TO_TIMESTAMP(TO_CHAR(v_next_monday + 7, 'YYYY-MM-DD') || ' 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(TO_CHAR(v_next_monday + 7, 'YYYY-MM-DD') || ' 11:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            'Cancelled meeting', 'Cancelled');
    
    -- Add a rejected booking
    INSERT INTO Booking (ERP, room_id, booking_date, start_time, end_time, purpose, status) 
    VALUES (10003, v_mc_breakout2_id, v_next_tuesday + 7,
            TO_TIMESTAMP(TO_CHAR(v_next_tuesday + 7, 'YYYY-MM-DD') || ' 14:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(TO_CHAR(v_next_tuesday + 7, 'YYYY-MM-DD') || ' 15:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            'Rejected by admin', 'Rejected');
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('8 bookings inserted with future dates.');
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Could not find one or more rooms for bookings.');
        ROLLBACK;
        RAISE;
END;
/

-- ============================================
-- 10. INSERT ANNOUNCEMENTS
-- ============================================
INSERT INTO Announcement (ERP, title, description, date_posted) 
VALUES (30003, 'Adamjee Building Maintenance', 
        'Please note that Adamjee building will undergo maintenance this Saturday. All rooms will be unavailable from 8 AM to 5 PM.',
        SYSTIMESTAMP);

INSERT INTO Announcement (ERP, title, description, date_posted) 
VALUES (30002, 'New Breakout Rooms Available', 
        'Two new breakout rooms (MC-BREAKOUT-1 and MC-BREAKOUT-2) are now available for booking in Aman CED building.',
        SYSTIMESTAMP - INTERVAL '1' DAY);

INSERT INTO Announcement (ERP, title, description, date_posted) 
VALUES (30001, 'Lab Equipment Upgrade', 
        'The computer labs in Tabba building will be upgraded with new equipment next week. Some labs may be temporarily unavailable.',
        SYSTIMESTAMP - INTERVAL '2' DAY);

INSERT INTO Announcement (ERP, title, description, date_posted) 
VALUES (30005, 'Executive Center Renovation', 
        'Executive Center will be partially closed for renovation next week. Please plan your bookings accordingly.',
        SYSTIMESTAMP - INTERVAL '3' DAY);

INSERT INTO Announcement (ERP, title, description, date_posted) 
VALUES (30004, 'Sports Complex Schedule Change', 
        'Due to sports events, the Sports Complex will have limited availability from tomorrow for one week.',
        SYSTIMESTAMP - INTERVAL '4' DAY);

COMMIT;

select * from user_table;


-- 2.1 All users with roles
SELECT ERP, name, email, role, phone_number, LENGTH(user_password) as password_length
FROM User_Table
ORDER BY role, ERP;

-- 2.2 Student users only
SELECT u.ERP, u.name, u.email, s.program, s.intake_year, u.phone_number
FROM User_Table u
JOIN Student s ON u.ERP = s.ERP
ORDER BY u.ERP;
-- 2.3 Admin users (PO and BI)
SELECT u.ERP, u.name, u.email, u.role, u.phone_number
FROM User_Table u
WHERE u.role IN ('ProgramOffice', 'BuildingIncharge')
ORDER BY u.role, u.ERP;

-- 3.1 All buildings
SELECT building_id, building_name
FROM Building
ORDER BY building_id;

-- 3.2 Rooms per building with types
SELECT b.building_name, r.room_id, r.room_name, r.room_type
FROM Room r
JOIN Building b ON r.building_id = b.building_id
ORDER BY b.building_name, r.room_type, r.room_name;

-- 3.3 Count of rooms by building and type
SELECT b.building_name, 
       r.room_type,
       COUNT(*) as room_count
FROM Room r
JOIN Building b ON r.building_id = b.building_id
GROUP BY b.building_name, r.room_type
ORDER BY b.building_name, r.room_type;

-- 4.1 Building incharges with building names
SELECT i.incharge_id, u.name as incharge_name, u.email, b.building_name
FROM Incharge i
JOIN User_Table u ON i.incharge_id = u.ERP
JOIN Building b ON i.building_id = b.building_id
ORDER BY b.building_name;

-- 4.2 Buildings without incharges (should be none)
SELECT b.building_id, b.building_name
FROM Building b
LEFT JOIN Incharge i ON b.building_id = i.building_id
WHERE i.incharge_id IS NULL
ORDER BY b.building_id;

-- 5.1 All schedule entries
SELECT s.schedule_id, b.building_name, r.room_name, 
       s.day_of_week, 
       TO_CHAR(s.start_time, 'HH24:MI') as start_time,
       TO_CHAR(s.end_time, 'HH24:MI') as end_time,
       s.course_code
FROM Schedule s
JOIN Room r ON s.room_id = r.room_id
JOIN Building b ON r.building_id = b.building_id
ORDER BY s.day_of_week, s.start_time;

-- 5.2 Schedule by day of week
SELECT day_of_week, COUNT(*) as class_count
FROM Schedule
GROUP BY day_of_week
ORDER BY 
    CASE day_of_week
        WHEN 'MONDAY' THEN 1
        WHEN 'TUESDAY' THEN 2
        WHEN 'WEDNESDAY' THEN 3
        WHEN 'THURSDAY' THEN 4
        WHEN 'FRIDAY' THEN 5
        WHEN 'SATURDAY' THEN 6
        ELSE 7
    END;

-- 6.1 All bookings with details
SELECT b.booking_id, u.name as student_name, u.ERP,
       bld.building_name, r.room_name, r.room_type,
       b.booking_date,
       TO_CHAR(b.start_time, 'YYYY-MM-DD HH24:MI') as start_datetime,
       TO_CHAR(b.end_time, 'YYYY-MM-DD HH24:MI') as end_datetime,
       b.purpose, b.status, b.created_date
FROM Booking b
JOIN User_Table u ON b.ERP = u.ERP
JOIN Room r ON b.room_id = r.room_id
JOIN Building bld ON r.building_id = bld.building_id
ORDER BY b.booking_date DESC, b.start_time DESC;

-- 6.2 Bookings by status
SELECT status, COUNT(*) as booking_count
FROM Booking
GROUP BY status
ORDER BY status;

-- 6.3 Bookings by student
SELECT u.ERP, u.name, COUNT(*) as total_bookings,
       SUM(CASE WHEN b.status = 'Approved' THEN 1 ELSE 0 END) as approved,
       SUM(CASE WHEN b.status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
       SUM(CASE WHEN b.status = 'Rejected' THEN 1 ELSE 0 END) as rejected
FROM Booking b
JOIN User_Table u ON b.ERP = u.ERP
GROUP BY u.ERP, u.name
ORDER BY u.ERP;

-- 6.4 Upcoming bookings (future dates only)
SELECT b.booking_id, u.name as student, bld.building_name, r.room_name,
       b.booking_date,
       TO_CHAR(b.start_time, 'HH24:MI') as start_time,
       TO_CHAR(b.end_time, 'HH24:MI') as end_time,
       b.purpose, b.status
FROM Booking b
JOIN User_Table u ON b.ERP = u.ERP
JOIN Room r ON b.room_id = r.room_id
JOIN Building bld ON r.building_id = bld.building_id
WHERE b.booking_date >= TRUNC(SYSDATE)
ORDER BY b.booking_date, b.start_time;

-- 7.1 All announcements with details
SELECT a.announcement_id, u.name as posted_by, b.building_name,
       a.title, a.description,
       TO_CHAR(a.date_posted, 'DD-MON-YYYY HH24:MI') as posted_date,
       TO_CHAR(a.created_date, 'DD-MON-YYYY HH24:MI') as created_date
FROM Announcement a
JOIN User_Table u ON a.ERP = u.ERP
LEFT JOIN Incharge i ON a.ERP = i.incharge_id
LEFT JOIN Building b ON i.building_id = b.building_id
ORDER BY a.date_posted DESC;

-- 7.2 Announcements by building incharge
SELECT u.name as incharge_name, b.building_name, COUNT(*) as announcement_count
FROM Announcement a
JOIN User_Table u ON a.ERP = u.ERP
JOIN Incharge i ON a.ERP = i.incharge_id
JOIN Building b ON i.building_id = b.building_id
GROUP BY u.name, b.building_name
ORDER BY b.building_name;

-- 8.1 All pending registrations
SELECT email, erp, name, role, phone_number, 
       verification_code,
       TO_CHAR(code_expiry, 'DD-MON-YYYY HH24:MI:SS') as expiry_time
FROM PendingRegistration
ORDER BY code_expiry;

-- 8.2 Check if any pending registrations are expired
SELECT email, name, 
       TO_CHAR(code_expiry, 'DD-MON-YYYY HH24:MI:SS') as expiry_time,
       CASE 
           WHEN code_expiry < SYSTIMESTAMP THEN 'EXPIRED'
           ELSE 'ACTIVE'
       END as status
FROM PendingRegistration
ORDER BY code_expiry;

-- 9.1 Students without corresponding User_Table entry (should be 0)
SELECT s.ERP, s.program, s.intake_year
FROM Student s
LEFT JOIN User_Table u ON s.ERP = u.ERP
WHERE u.ERP IS NULL;

-- 9.2 Bookings for non-existent users (should be 0)
SELECT b.booking_id, b.ERP
FROM Booking b
LEFT JOIN User_Table u ON b.ERP = u.ERP
WHERE u.ERP IS NULL;

-- 9.3 Bookings for non-existent rooms (should be 0)
SELECT b.booking_id, b.room_id
FROM Booking b
LEFT JOIN Room r ON b.room_id = r.room_id
WHERE r.room_id IS NULL;

-- 9.4 Schedule for non-existent rooms (should be 0)
SELECT s.schedule_id, s.room_id
FROM Schedule s
LEFT JOIN Room r ON s.room_id = r.room_id
WHERE r.room_id IS NULL;

-- 1. What's actually in your Announcement table RIGHT NOW?
SELECT announcement_id, ERP, title, description, date_posted 
FROM Announcement 
ORDER BY announcement_id;

-- 2. Do these ERPs exist in User_Table?
SELECT ERP, name, role 
FROM User_Table 
WHERE ERP IN (30001, 30002, 30003, 30004, 30005);

-- 3. Are these ERPs in the Incharge table?
SELECT incharge_id, building_id 
FROM Incharge 
WHERE incharge_id IN (30001, 30002, 30003, 30004, 30005);

-- 4. What does your procedure ACTUALLY return?
-- Run this PL/SQL block:
SET SERVEROUTPUT ON;
DECLARE
    v_cursor SYS_REFCURSOR;
    v_id NUMBER;
    v_title VARCHAR2(100);
    v_desc VARCHAR2(300);
    v_date TIMESTAMP;
    v_name VARCHAR2(100);
    v_building VARCHAR2(50);
    v_count NUMBER := 0;
BEGIN
    ShowAllAnnouncements(v_cursor);
    
    LOOP
        FETCH v_cursor INTO v_id, v_title, v_desc, v_date, v_name, v_building;
        EXIT WHEN v_cursor%NOTFOUND;
        
        v_count := v_count + 1;
        DBMS_OUTPUT.PUT_LINE('Row ' || v_count || ':');
        DBMS_OUTPUT.PUT_LINE('  ID: ' || v_id);
        DBMS_OUTPUT.PUT_LINE('  Title: ' || v_title);
        DBMS_OUTPUT.PUT_LINE('  Posted by: ' || v_name);
        DBMS_OUTPUT.PUT_LINE('  Building: ' || v_building);
        DBMS_OUTPUT.PUT_LINE('  Date: ' || TO_CHAR(v_date, 'DD-MON-YYYY HH24:MI'));
    END LOOP;
    
    CLOSE v_cursor;
    
    IF v_count = 0 THEN
        DBMS_OUTPUT.PUT_LINE('Procedure returned NO ROWS!');
    ELSE
        DBMS_OUTPUT.PUT_LINE(' Procedure returned ' || v_count || ' rows');
    END IF;
END;
/

select * from booking;