import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Sets background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell padding in dxa."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tc_pr.append(tc_mar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    """Applies neat borders to a table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_heading_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    h.paragraph_format.space_before = Pt(14 if level == 1 else 10)
    h.paragraph_format.space_after = Pt(4)
    run = h.runs[0]
    if level == 1:
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79) # Deep Blue like hansith
    elif level == 2:
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x2E, 0x5B, 0x82)
    elif level == 3:
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    return h

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F4F6F8")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Border
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="D0D7DE"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D0D7DE"/>
            <w:left w:val="single" w:sz="16" w:space="0" w:color="1F4E79"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="D0D7DE"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(0x24, 0x29, 0x2E)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def add_styled_table(doc, headers, data, col_widths=None, header_bg="D9E1F2"):
    tbl = doc.add_table(rows=len(data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color="B0C4DE", sz="4")
    
    # Header row
    hdr_cells = tbl.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], header_bg)
        set_cell_margins(hdr_cells[i], top=80, bottom=80, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.runs[0]
        run.font.bold = True
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(0x1F, 0x38, 0x64)
    
    # Data rows
    for r_idx, row_data in enumerate(data):
        row_cells = tbl.rows[r_idx + 1].cells
        bg_color = "F9FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
            if bg_color != "FFFFFF":
                set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=60, bottom=60, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(8.5)
                p.runs[0].font.color.rgb = RGBColor(0x33, 0x33, 0x33)
                
    # Column widths
    if col_widths:
        for row in tbl.rows:
            for c_idx, w in enumerate(col_widths):
                row.cells[c_idx].width = Inches(w)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return tbl

def generate_report():
    doc = Document()
    
    # Set standard 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    assets_dir = "/Users/mithijaiswal/Desktop/DBMS PBL/Project-Report/assets"
    
    # -------------------------------------------------------------
    # PAGE 1: TITLE PAGE (Matching hansith.pdf exactly)
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(36)
    title_p.paragraph_format.space_after = Pt(8)
    run_title = title_p.add_run("Campus Facility Maintenance Request\nManagement System")
    run_title.font.name = "Georgia"
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    
    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(36)
    run_sub = sub_p.add_run("DBMS Course Project Report")
    run_sub.font.name = "Georgia"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    
    # Logo
    logo_path = os.path.join(assets_dir, "woxsen_logo.jpeg")
    if os.path.exists(logo_path):
        logo_p = doc.add_paragraph()
        logo_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        logo_p.paragraph_format.space_before = Pt(20)
        logo_p.paragraph_format.space_after = Pt(40)
        logo_run = logo_p.add_run()
        logo_run.add_picture(logo_path, width=Inches(2.5))
    else:
        spacer = doc.add_paragraph()
        spacer.paragraph_format.space_after = Pt(100)
        
    details_p = doc.add_paragraph()
    details_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    details_p.paragraph_format.space_before = Pt(24)
    details_p.paragraph_format.line_spacing = 1.35
    
    details = [
        ("Student Name: ", "Mithi Jaiswal"),
        ("Roll Number: ", "25WU0102158"),
        ("Course: ", "Database Management Systems (DBMS)"),
        ("Academic Year: ", "2025–2029"),
        ("Project Type: ", "DBMS Course Project"),
        ("University: ", "Woxsen University"),
        ("Branch: ", "CSE - AIML")
    ]
    
    for label, val in details:
        r_lbl = details_p.add_run(label)
        r_lbl.font.name = "Georgia"
        r_lbl.font.size = Pt(11)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
        
        r_val = details_p.add_run(val + "\n")
        r_val.font.name = "Georgia"
        r_val.font.size = Pt(11)
        r_val.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # 2. ABSTRACT
    # -------------------------------------------------------------
    add_heading_styled(doc, "2. Abstract", 1)
    p_abs = doc.add_paragraph()
    p_abs.paragraph_format.line_spacing = 1.2
    p_abs.paragraph_format.space_after = Pt(12)
    p_abs.add_run(
        "The Campus Facility Maintenance Request Management System is a database-driven web application developed to "
        "manage campus buildings, rooms, equipment assets, service requests, technician assignments, labor work logs, spare parts inventory, "
        "repair expenditures, user feedback, and lifecycle status audits in a structured relational system. The application uses MySQL as the "
        "database layer, Next.js 16 with Node.js runtime and TypeScript for backend API services, React 19 with Tailwind CSS for modern responsive "
        "user interface delivery, and Prisma ORM for database connectivity and schema migrations. The system supports online complaint lodging, "
        "priority-based SLA tracking, technician dispatching, real-time spare material stock depletion, itemized expense vouchers, star-rated user "
        "satisfaction reviews, and executive management reports. Multi-table operations execute within atomic database transactions "
        "(prisma.$transaction) ensuring complete relational consistency, while primary keys, foreign keys, check constraints, and cascading rules "
        "protect data integrity."
    )
    
    # -------------------------------------------------------------
    # 3. INTRODUCTION AND PROBLEM STATEMENT
    # -------------------------------------------------------------
    add_heading_styled(doc, "3. Introduction and Problem Statement", 1)
    
    add_heading_styled(doc, "3.1 Introduction", 2)
    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.line_spacing = 1.2
    p_intro.paragraph_format.space_after = Pt(10)
    p_intro.add_run(
        "University campuses encompass extensive physical infrastructure consisting of academic complexes, laboratory blocks, residential hostels, "
        "libraries, and sports facilities. Daily operational wear and tear creates continuous maintenance data: students and faculty submit repair "
        "tickets, tickets map to specific physical rooms and buildings, facilities contain high-value equipment assets, facility managers assign specialized "
        "technicians, technicians log labor hours, repairs consume spare parts from inventory, financial costs accumulate across labor and materials, and "
        "users submit feedback on resolution quality. Managing these inter-dependent workflows using paper logs or disconnected spreadsheets results in "
        "duplicate entries, untracked inventory depletion, unresolved overdue tickets, and lack of accountability. This project models the complete "
        "campus facility maintenance workflow using a normalized relational database and an interactive web application."
    )
    
    add_heading_styled(doc, "3.2 Problem Statement", 2)
    p_prob = doc.add_paragraph()
    p_prob.paragraph_format.line_spacing = 1.2
    p_prob.paragraph_format.space_after = Pt(12)
    p_prob.add_run(
        "The university requires a centralized, transparent system to record maintenance complaints, route them to qualified technicians, monitor SLA "
        "response times, manage spare parts inventory, record itemized financial costs, and generate administrative reports. The system must preserve strict "
        "relational integrity between records and prevent invalid operations such as assigning busy technicians, consuming unavailable spare parts, "
        "executing invalid status transitions, recording negative labor hours, or leaving orphan records when tickets or facility assets are removed."
    )
    
    # -------------------------------------------------------------
    # 4. OBJECTIVES AND SCOPE
    # -------------------------------------------------------------
    add_heading_styled(doc, "4. Objectives and Scope", 1)
    
    add_heading_styled(doc, "4.1 Objectives", 2)
    objectives = [
        "Maintain buildings, rooms, fixed assets, users, technicians, categories, priority SLAs, maintenance requests, assignments, work logs, materials, costs, feedback, and status history in MySQL.",
        "Provide full CRUD operations for Requests, Infrastructure (Buildings & Rooms), Asset Registry, Technicians, and Materials through a responsive web interface.",
        "Provide an intuitive online ticket lodging interface with category, room, and priority selection backed by client-side and server-side validation.",
        "Execute multi-table ticket assignments, material allocations, cost logging, and cascading deletions as all-or-nothing database transactions.",
        "Manage maintenance execution using controlled status transitions (Pending -> Assigned -> In Progress -> Completed/Closed) with automated audit logging in STATUS_HISTORY.",
        "Monitor spare parts inventory in real-time, automatically deducting quantities used and flagging low-stock items.",
        "Generate itemized cost records (Materials, Labor, Hardware, Electrical) for completed maintenance jobs.",
        "Provide six comprehensive PBL analytical reports utilizing relational joins, nested subqueries, grouping aggregations, and database views."
    ]
    for obj in objectives:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        p.add_run(obj)
        
    add_heading_styled(doc, "4.2 Scope", 2)
    scopes = [
        "Campus-wide infrastructure mapping (Buildings, Floors, Rooms, Fixed Assets).",
        "Role-based interaction for Students, Faculty, Staff, Technicians, and Facility Managers.",
        "Maintenance request lifecycle management from complaint logging to technician verification.",
        "Spare parts inventory tracking, restocking, and automated expenditure calculation.",
        "Executive analytics for ticket ageing, SLA compliance, technician workload, building costs, material consumption, and user ratings.",
        "Production-grade local web application deployment using Next.js 16, TypeScript, React 19, Prisma ORM, and MySQL."
    ]
    for sc in scopes:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        p.add_run(sc)

    # -------------------------------------------------------------
    # 5. SOFTWARE AND HARDWARE REQUIREMENTS
    # -------------------------------------------------------------
    add_heading_styled(doc, "5. Software and Hardware Requirements", 1)
    req_headers = ["Category", "Requirement"]
    req_data = [
        ["Operating System", "Windows 10/11 / macOS 14+ / Ubuntu Linux 22.04 LTS"],
        ["Backend Runtime", "Next.js 16 App Router (Node.js 20+ runtime)"],
        ["Database", "MySQL 8.0 / 9.x Community Server"],
        ["DB Connectivity & ORM", "Prisma ORM 6.4 (@prisma/client, Prisma CLI)"],
        ["Frontend UI", "React 19, TypeScript 5, Tailwind CSS"],
        ["Styling Architecture", "Custom Warm Pastel Design System (Vanilla CSS + Tailwind)"],
        ["Package Manager / Runtime", "Bun 1.4 / npm 10"],
        ["Testing & Verification", "Vitest, TypeScript strict compiler, MySQL test suite"],
        ["Browser", "Modern Chromium (Chrome, Edge) / Firefox / Safari"],
        ["Recommended Hardware", "Dual-core 64-bit processor, 8 GB RAM, 10 GB free disk storage"]
    ]
    add_styled_table(doc, req_headers, req_data, col_widths=[2.5, 4.0], header_bg="D9E1F2")

    # -------------------------------------------------------------
    # 6. ER DIAGRAM
    # -------------------------------------------------------------
    add_heading_styled(doc, "6. ER Diagram", 1)
    p_er = doc.add_paragraph()
    p_er.paragraph_format.space_after = Pt(8)
    p_er.add_run("The Entity-Relationship (ER) diagram represents the 15 relational entities used by the campus facility management system and their structural associations:")
    
    er_path = os.path.join(assets_dir, "er_diagram.png")
    if os.path.exists(er_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(er_path, width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        run_cap = p_cap.add_run("Figure 1: Entity-Relationship Diagram for Campus Facility Management System")
        run_cap.font.italic = True
        run_cap.font.size = Pt(9.5)
        run_cap.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

    # -------------------------------------------------------------
    # 7. RELATIONAL SCHEMA AND NORMALIZATION
    # -------------------------------------------------------------
    add_heading_styled(doc, "7. Relational Schema and Normalization", 1)
    add_heading_styled(doc, "7.1 Relational Schema", 2)
    
    schema_tables = [
        ("7.1 BUILDINGS", [
            ["BuildingID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["Name", "varchar(100)", "NO", "", "NULL", ""],
            ["Address", "varchar(200)", "NO", "", "NULL", ""],
            ["CampusLocation", "varchar(100)", "NO", "", "NULL", ""]
        ]),
        ("7.2 ROOMS", [
            ["RoomID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["BuildingID", "int", "NO", "MUL", "NULL", ""],
            ["RoomNumber", "varchar(20)", "NO", "", "NULL", ""],
            ["FloorLevel", "int", "NO", "", "NULL", ""]
        ]),
        ("7.3 ASSETS", [
            ["AssetID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["RoomID", "int", "NO", "MUL", "NULL", ""],
            ["AssetName", "varchar(100)", "NO", "", "NULL", ""],
            ["Type", "varchar(50)", "NO", "", "NULL", ""],
            ["PurchaseDate", "date", "YES", "", "NULL", ""],
            ["Status", "varchar(30)", "NO", "", "NULL", ""]
        ]),
        ("7.4 USERS", [
            ["UserID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["FirstName", "varchar(50)", "NO", "", "NULL", ""],
            ["LastName", "varchar(50)", "NO", "", "NULL", ""],
            ["Email", "varchar(100)", "NO", "UNI", "NULL", ""],
            ["PhoneNumber", "varchar(15)", "YES", "", "NULL", ""],
            ["UserRole", "varchar(30)", "NO", "", "NULL", ""]
        ]),
        ("7.5 TECHNICIANS", [
            ["TechnicianID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["FirstName", "varchar(50)", "NO", "", "NULL", ""],
            ["LastName", "varchar(50)", "NO", "", "NULL", ""],
            ["Specialization", "varchar(50)", "NO", "", "NULL", ""],
            ["AvailabilityStatus", "varchar(30)", "NO", "", "Available", ""]
        ]),
        ("7.6 CATEGORIES", [
            ["CategoryID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["CategoryName", "varchar(50)", "NO", "UNI", "NULL", ""]
        ]),
        ("7.7 PRIORITY", [
            ["PriorityID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["LevelName", "varchar(30)", "NO", "UNI", "NULL", ""],
            ["ResponseTime", "varchar(50)", "NO", "", "NULL", ""]
        ]),
        ("7.8 REQUESTS", [
            ["RequestID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["UserID", "int", "NO", "MUL", "NULL", ""],
            ["RoomID", "int", "NO", "MUL", "NULL", ""],
            ["CategoryID", "int", "NO", "MUL", "NULL", ""],
            ["PriorityID", "int", "NO", "MUL", "NULL", ""],
            ["Description", "varchar(500)", "NO", "", "NULL", ""],
            ["DateSubmitted", "date", "NO", "", "NULL", ""],
            ["CurrentStatus", "varchar(30)", "NO", "", "Pending", ""]
        ]),
        ("7.9 ASSIGNMENT", [
            ["AssignmentID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["RequestID", "int", "NO", "MUL", "NULL", ""],
            ["TechnicianID", "int", "NO", "MUL", "NULL", ""],
            ["AssignmentDate", "date", "NO", "", "NULL", ""],
            ["CompletionDate", "date", "YES", "", "NULL", ""]
        ]),
        ("7.10 WORK_LOG", [
            ["LogID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["AssignmentID", "int", "NO", "MUL", "NULL", ""],
            ["LogEntryDate", "date", "NO", "", "NULL", ""],
            ["Description", "varchar(500)", "NO", "", "NULL", ""],
            ["HoursSpent", "decimal(5,2)", "NO", "", "NULL", ""]
        ]),
        ("7.11 REQUEST_MATERIALS", [
            ["RequestID", "int", "NO", "PRI", "NULL", ""],
            ["MaterialID", "int", "NO", "PRI", "NULL", ""],
            ["QuantityUsed", "int", "NO", "", "NULL", ""]
        ]),
        ("7.12 MATERIALS", [
            ["MaterialID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["MaterialName", "varchar(100)", "NO", "", "NULL", ""],
            ["UnitCost", "decimal(10,2)", "NO", "", "NULL", ""],
            ["QuantityInStock", "int", "NO", "", "0", ""]
        ]),
        ("7.13 COST", [
            ["CostID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["RequestID", "int", "NO", "MUL", "NULL", ""],
            ["CostType", "varchar(50)", "NO", "", "NULL", ""],
            ["Amount", "decimal(10,2)", "NO", "", "NULL", ""],
            ["IncurredDate", "date", "NO", "", "NULL", ""]
        ]),
        ("7.14 FEEDBACK", [
            ["FeedbackID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["RequestID", "int", "NO", "MUL", "NULL", ""],
            ["Rating", "int", "NO", "", "NULL", ""],
            ["Comments", "varchar(500)", "YES", "", "NULL", ""],
            ["SubmissionDate", "date", "NO", "", "NULL", ""]
        ]),
        ("7.15 STATUS_HISTORY", [
            ["StatusLogID", "int", "NO", "PRI", "NULL", "auto_increment"],
            ["RequestID", "int", "NO", "MUL", "NULL", ""],
            ["StatusChangeDate", "date", "NO", "", "NULL", ""],
            ["PreviousStatus", "varchar(30)", "YES", "", "NULL", ""],
            ["NewStatus", "varchar(30)", "NO", "", "NULL", ""]
        ])
    ]
    
    table_headers = ["Field", "Type", "Null", "Key", "Default", "Extra"]
    col_w = [1.6, 1.3, 0.6, 0.7, 1.0, 1.3]
    
    for tbl_title, tbl_rows in schema_tables:
        add_heading_styled(doc, tbl_title, 3)
        add_styled_table(doc, table_headers, tbl_rows, col_widths=col_w, header_bg="E6EEF8")
        
    p_note = doc.add_paragraph()
    p_note.paragraph_format.space_before = Pt(6)
    p_note.paragraph_format.space_after = Pt(12)
    p_note.add_run("Note: ").bold = True
    p_note.add_run("The tables above reproduce the actual MySQL DESCRIBE structure of the implemented database, detailing Field, Type, Nullability, Key constraints, Default values, and Extra auto-increment parameters.")
    
    add_heading_styled(doc, "7.2 Normalization", 2)
    p_norm = doc.add_paragraph()
    p_norm.paragraph_format.line_spacing = 1.2
    p_norm.paragraph_format.space_after = Pt(10)
    p_norm.add_run(
        "The database design strictly adheres to 1NF, 2NF, and 3NF normalization rules:\n"
        "• First Normal Form (1NF): All attributes contain strictly atomic values. Repeating groups such as multiple materials consumed on a repair are factored out into a dedicated child table (REQUEST_MATERIALS). Each record is uniquely identified by a primary key.\n"
        "• Second Normal Form (2NF): The schema is in 1NF and contains zero partial functional dependencies. In tables with composite primary keys like REQUEST_MATERIALS (RequestID, MaterialID), the attribute QuantityUsed functionally depends on the entire composite key. Entity metadata such as MaterialName and UnitCost reside strictly in MATERIALS.\n"
        "• Third Normal Form (3NF): The schema is in 2NF and exhibits zero transitive dependencies. In REQUESTS, the ticket references RoomID as a foreign key; physical building details (Name, CampusLocation) reside strictly in BUILDINGS via ROOMS.BuildingID. This prevents transitive dependencies of the form RequestID -> RoomID -> BuildingName and eliminates insertion, update, and deletion anomalies."
    )

    # -------------------------------------------------------------
    # 8. DATABASE & TABLE CREATION (DDL) AND REPRESENTATIVE DML
    # -------------------------------------------------------------
    add_heading_styled(doc, "8. Database Creation and Representative SQL", 1)
    
    add_heading_styled(doc, "8.1 Database and Table Creation (DDL)", 2)
    ddl_sample = (
        "CREATE DATABASE IF NOT EXISTS campus_facility_management;\n"
        "USE campus_facility_management;\n\n"
        "CREATE TABLE BUILDINGS (\n"
        "  BuildingID INT NOT NULL AUTO_INCREMENT,\n"
        "  Name VARCHAR(100) NOT NULL,\n"
        "  Address VARCHAR(200) NOT NULL,\n"
        "  CampusLocation VARCHAR(100) NOT NULL,\n"
        "  PRIMARY KEY (BuildingID)\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n"
        "CREATE TABLE ROOMS (\n"
        "  RoomID INT NOT NULL AUTO_INCREMENT,\n"
        "  BuildingID INT NOT NULL,\n"
        "  RoomNumber VARCHAR(20) NOT NULL,\n"
        "  FloorLevel INT NOT NULL,\n"
        "  PRIMARY KEY (RoomID),\n"
        "  FOREIGN KEY (BuildingID) REFERENCES BUILDINGS(BuildingID) ON DELETE CASCADE\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n"
        "CREATE TABLE REQUESTS (\n"
        "  RequestID INT NOT NULL AUTO_INCREMENT,\n"
        "  UserID INT NOT NULL,\n"
        "  RoomID INT NOT NULL,\n"
        "  CategoryID INT NOT NULL,\n"
        "  PriorityID INT NOT NULL,\n"
        "  Description VARCHAR(500) NOT NULL,\n"
        "  DateSubmitted DATE NOT NULL,\n"
        "  CurrentStatus VARCHAR(30) NOT NULL DEFAULT 'Pending',\n"
        "  PRIMARY KEY (RequestID),\n"
        "  FOREIGN KEY (UserID) REFERENCES USERS(UserID),\n"
        "  FOREIGN KEY (RoomID) REFERENCES ROOMS(RoomID),\n"
        "  FOREIGN KEY (CategoryID) REFERENCES CATEGORIES(CategoryID),\n"
        "  FOREIGN KEY (PriorityID) REFERENCES PRIORITY(PriorityID)\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    )
    add_code_block(doc, ddl_sample)
    
    add_heading_styled(doc, "8.2 Representative DML Operations", 2)
    dml_sample = (
        "-- Insert Record into REQUESTS table\n"
        "INSERT INTO REQUESTS (UserID, RoomID, CategoryID, PriorityID, Description, DateSubmitted, CurrentStatus)\n"
        "VALUES (1, 101, 1, 4, 'Laboratory 3-phase outlet sparking on load activation', '2026-09-14', 'Pending');\n\n"
        "-- Update Status and Availability upon Technician Assignment\n"
        "UPDATE REQUESTS SET CurrentStatus = 'Assigned' WHERE RequestID = 5015;\n"
        "UPDATE TECHNICIANS SET AvailabilityStatus = 'Busy' WHERE TechnicianID = 205;\n\n"
        "-- Cascading Delete Operation (Handled via transaction in application logic)\n"
        "DELETE FROM WORK_LOG WHERE AssignmentID IN (SELECT AssignmentID FROM ASSIGNMENT WHERE RequestID = 5016);\n"
        "DELETE FROM ASSIGNMENT WHERE RequestID = 5016;\n"
        "DELETE FROM REQUESTS WHERE RequestID = 5016;"
    )
    add_code_block(doc, dml_sample)
    
    add_heading_styled(doc, "8.3 Sample Execution Verification", 2)
    p_ver = doc.add_paragraph()
    p_ver.paragraph_format.line_spacing = 1.2
    p_ver.add_run("• SHOW TABLES; ").bold = True
    p_ver.add_run("→ All 15 relational tables (BUILDINGS, ROOMS, ASSETS, USERS, TECHNICIANS, CATEGORIES, PRIORITY, REQUESTS, ASSIGNMENT, WORK_LOG, REQUEST_MATERIALS, MATERIALS, COST, FEEDBACK, STATUS_HISTORY) verified and active.\n")
    p_ver.add_run("• SELECT COUNT(*) FROM REQUESTS; ").bold = True
    p_ver.add_run("→ 15 seeded production-grade complaints verified across 7 academic & residential blocks.\n")
    p_ver.add_run("• SELECT COUNT(*) FROM MATERIALS; ").bold = True
    p_ver.add_run("→ 10 distinct spare parts cataloged with real-time stock and unit prices.")

    # -------------------------------------------------------------
    # 9. QUERIES WITH OUTPUTS, INCLUDING PRESENTATION-II QUERY
    # -------------------------------------------------------------
    add_heading_styled(doc, "9. Queries with Outputs, including Presentation-II Query", 1)
    
    # 9.1 Presentation II Query
    add_heading_styled(doc, "9.1 Presentation-II Query — Complaints by 'Ananya Rao'", 2)
    p_q1_desc = doc.add_paragraph()
    p_q1_desc.paragraph_format.space_after = Pt(4)
    p_q1_desc.add_run("Specification: Retrieve the category name, priority level, SLA response time, and current status for all maintenance complaints logged by student Ananya Rao.")
    
    sql_q1 = (
        "SELECT \n"
        "  c.CategoryName AS Category, \n"
        "  p.LevelName AS Priority, \n"
        "  p.ResponseTime,\n"
        "  r.CurrentStatus AS Status\n"
        "FROM REQUESTS r\n"
        "JOIN USERS u ON r.UserID = u.UserID\n"
        "JOIN CATEGORIES c ON r.CategoryID = c.CategoryID\n"
        "JOIN PRIORITY p ON r.PriorityID = p.PriorityID\n"
        "WHERE u.FirstName = 'Ananya' AND u.LastName = 'Rao';"
    )
    add_code_block(doc, sql_q1)
    
    p_out1 = doc.add_paragraph()
    p_out1.add_run("Actual MySQL Output:").bold = True
    p_out1.paragraph_format.space_after = Pt(4)
    out1_headers = ["Category", "Priority", "ResponseTime", "Status"]
    out1_data = [
        ["Furniture", "Medium", "24 Hours", "Completed"],
        ["Cleaning", "Low", "48 Hours", "Pending"]
    ]
    add_styled_table(doc, out1_headers, out1_data, col_widths=[1.6, 1.4, 1.8, 1.7])
    
    # 9.2 Building-wise Expenditure
    add_heading_styled(doc, "9.2 Building-wise Maintenance Expenditure Summary", 2)
    sql_q2 = (
        "SELECT \n"
        "  b.BuildingID,\n"
        "  b.Name AS BuildingName,\n"
        "  b.CampusLocation,\n"
        "  COUNT(DISTINCT r.RequestID) AS TotalRequests,\n"
        "  COALESCE(SUM(c.Amount), 0) AS TotalCost_INR\n"
        "FROM BUILDINGS b\n"
        "LEFT JOIN ROOMS rm ON b.BuildingID = rm.BuildingID\n"
        "LEFT JOIN REQUESTS r ON rm.RoomID = r.RoomID\n"
        "LEFT JOIN COST c ON r.RequestID = c.RequestID\n"
        "GROUP BY b.BuildingID, b.Name, b.CampusLocation\n"
        "ORDER BY TotalCost_INR DESC;"
    )
    add_code_block(doc, sql_q2)
    
    p_out2 = doc.add_paragraph()
    p_out2.add_run("Actual MySQL Output:").bold = True
    p_out2.paragraph_format.space_after = Pt(4)
    out2_headers = ["BuildingID", "BuildingName", "CampusLocation", "TotalRequests", "TotalCost_INR"]
    out2_data = [
        ["1", "Academic Block A", "Main Campus", "4", "1430.00"],
        ["2", "Hostel Block B", "Residential Area", "3", "910.00"],
        ["5", "Science & Innovation Complex", "North Campus", "2", "840.00"],
        ["4", "Sports Complex", "Sports Area", "1", "750.00"],
        ["3", "Library Block", "Central Campus", "2", "540.00"],
        ["6", "Student Activity Hub", "Central Campus", "1", "0.00"],
        ["7", "Executive Residences Block C", "Residential Area", "0", "0.00"]
    ]
    add_styled_table(doc, out2_headers, out2_data, col_widths=[1.0, 2.2, 1.6, 1.0, 1.2])

    # 9.3 Technician Workload
    add_heading_styled(doc, "9.3 Technician Workload and Total Hours Logged", 2)
    sql_q3 = (
        "SELECT \n"
        "  t.TechnicianID,\n"
        "  CONCAT(t.FirstName, ' ', t.LastName) AS Technician,\n"
        "  t.Specialization,\n"
        "  t.AvailabilityStatus,\n"
        "  COUNT(DISTINCT a.AssignmentID) AS TotalAssignments,\n"
        "  COALESCE(SUM(wl.HoursSpent), 0) AS TotalHoursLogged\n"
        "FROM TECHNICIANS t\n"
        "LEFT JOIN ASSIGNMENT a ON t.TechnicianID = a.TechnicianID\n"
        "LEFT JOIN WORK_LOG wl ON a.AssignmentID = wl.AssignmentID\n"
        "GROUP BY t.TechnicianID, t.FirstName, t.LastName, t.Specialization, t.AvailabilityStatus\n"
        "ORDER BY TotalHoursLogged DESC;"
    )
    add_code_block(doc, sql_q3)
    
    p_out3 = doc.add_paragraph()
    p_out3.add_run("Actual MySQL Output:").bold = True
    p_out3.paragraph_format.space_after = Pt(4)
    out3_headers = ["TechnicianID", "Technician", "Specialization", "AvailabilityStatus", "TotalAssignments", "TotalHoursLogged"]
    out3_data = [
        ["201", "Amit Kumar", "Electrical", "Available", "3", "6.00"],
        ["202", "Suresh Reddy", "Plumbing", "Busy", "2", "4.75"],
        ["203", "Neeraj Sharma", "Networking", "Available", "2", "4.00"],
        ["208", "Sunil Rao", "Audio-Visual", "Available", "1", "1.75"],
        ["206", "Rajesh Goud", "Civil & Carpentry", "Available", "1", "1.50"],
        ["204", "Karan Singh", "Furniture", "Available", "1", "1.00"],
        ["205", "Vikram Patel", "General Maintenance", "Available", "1", "0.00"],
        ["207", "Deepa Sen", "HVAC Specialist", "Available", "0", "0.00"]
    ]
    add_styled_table(doc, out3_headers, out3_data, col_widths=[1.0, 1.4, 1.4, 1.2, 1.1, 1.1])

    # 9.4 Spare Material Consumption
    add_heading_styled(doc, "9.4 Spare Material Consumption and Stock Depletion", 2)
    sql_q4 = (
        "SELECT \n"
        "  m.MaterialID,\n"
        "  m.MaterialName,\n"
        "  m.UnitCost,\n"
        "  m.QuantityInStock AS RemainingStock,\n"
        "  COALESCE(SUM(rm.QuantityUsed), 0) AS TotalQuantityUsed,\n"
        "  COALESCE(SUM(rm.QuantityUsed * m.UnitCost), 0) AS TotalSpent_INR\n"
        "FROM MATERIALS m\n"
        "LEFT JOIN REQUEST_MATERIALS rm ON m.MaterialID = rm.MaterialID\n"
        "GROUP BY m.MaterialID, m.MaterialName, m.UnitCost, m.QuantityInStock\n"
        "ORDER BY TotalQuantityUsed DESC;"
    )
    add_code_block(doc, sql_q4)
    
    p_out4 = doc.add_paragraph()
    p_out4.add_run("Actual MySQL Output:").bold = True
    p_out4.paragraph_format.space_after = Pt(4)
    out4_headers = ["MaterialID", "MaterialName", "UnitCost", "RemainingStock", "TotalQuantityUsed", "TotalSpent_INR"]
    out4_data = [
        ["304", "Network Cable", "75.00", "150", "10", "750.00"],
        ["302", "PVC Pipe", "120.00", "80", "5", "600.00"],
        ["305", "Chair Wheel", "90.00", "60", "4", "360.00"],
        ["307", "Cat6 Shielded RJ45 Jack", "45.00", "220", "4", "180.00"],
        ["301", "Copper Wire", "250.00", "48", "3", "750.00"],
        ["303", "LED Bulb", "180.00", "100", "2", "360.00"],
        ["308", "32A Industrial MCB Switch", "420.00", "35", "2", "840.00"],
        ["306", "Heavy Door Latch & Lockset", "320.00", "45", "1", "320.00"],
        ["309", "Brass Ball Valve 1-inch", "310.00", "40", "1", "310.00"],
        ["310", "Refrigerant Gas R410A (kg)", "850.00", "25", "0", "0.00"]
    ]
    add_styled_table(doc, out4_headers, out4_data, col_widths=[1.0, 1.8, 1.0, 1.1, 1.2, 1.1])

    # -------------------------------------------------------------
    # 10. UI DESIGN AND SCREENSHOTS
    # -------------------------------------------------------------
    add_heading_styled(doc, "10. UI Design and Screenshots", 1)
    p_ui_intro = doc.add_paragraph()
    p_ui_intro.paragraph_format.space_after = Pt(10)
    p_ui_intro.add_run("The following screenshots demonstrate the implemented fullstack Campus Facility Maintenance web application running live:")
    
    ui_screenshots = [
        ("figure1_dashboard.png", "Figure 2: Campus Facility Maintenance Requests Dashboard with Real-Time Filtering"),
        ("figure2_ticket_details.png", "Figure 3: Interactive Ticket Inspection & Audit Drawer with Technician, Work Log, Materials, and Cost"),
        ("figure3_analytics.png", "Figure 4: Six Mandatory Course Project Analytical Reports Dashboard (Ageing, SLA, Workload, Costs)"),
        ("figure4_infrastructure.png", "Figure 5: Campus Infrastructure & Asset Registry with Edit/Delete Management")
    ]
    
    for img_file, cap_text in ui_screenshots:
        fpath = os.path.join(assets_dir, img_file)
        if os.path.exists(fpath):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(2)
            run = p_img.add_run()
            run.add_picture(fpath, width=Inches(6.2))
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(14)
            run_cap = p_cap.add_run(cap_text)
            run_cap.font.italic = True
            run_cap.font.size = Pt(9.5)
            run_cap.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

    # -------------------------------------------------------------
    # 11. IMPLEMENTATION DETAILS
    # -------------------------------------------------------------
    add_heading_styled(doc, "11. Implementation Details", 1)
    
    add_heading_styled(doc, "11.1 Technology Stack", 2)
    tech_headers = ["Layer", "Technology", "Purpose"]
    tech_data = [
        ["Database", "MySQL 8.x / 9.x", "Persistent relational database storage with ACID guarantees"],
        ["ORM / Client", "Prisma ORM 6.4", "Type-safe database client, schema migrations, and queries"],
        ["Backend Runtime", "Next.js 16 (Node.js)", "Server-side RESTful API route handlers and business logic"],
        ["Frontend UI", "React 19, TypeScript", "Dynamic component-based client application and state management"],
        ["Styling", "Vanilla CSS + Tailwind", "Minimal warm pastel aesthetic (#C86446, #FAF8F5, #EAE5DC)"],
        ["Icons & Assets", "Lucide React", "Lightweight vector UI icons for navigation and operational triggers"],
        ["Build Tool", "Turbopack", "Sub-second dev server compilation and production optimization"]
    ]
    add_styled_table(doc, tech_headers, tech_data, col_widths=[1.5, 2.0, 3.2])
    
    add_heading_styled(doc, "11.2 DB Connectivity and Transaction Pattern", 2)
    p_tx_desc = doc.add_paragraph()
    p_tx_desc.paragraph_format.space_after = Pt(4)
    p_tx_desc.add_run("Every multi-table write uses atomic transactions via prisma.$transaction to guarantee that ticket updates, inventory deductions, and audit logging succeed as a unified all-or-nothing operation:")
    
    tx_code = (
        "// Atomic multi-table write pattern executed in Next.js API route\n"
        "const result = await prisma.$transaction(async (tx) => {\n"
        "  // 1. Decrement inventory stock in MATERIALS\n"
        "  const updatedMaterial = await tx.mATERIALS.update({\n"
        "    where: { MaterialID: materialId },\n"
        "    data: { QuantityInStock: { decrement: quantityUsed } },\n"
        "  });\n"
        "  \n"
        "  // 2. Insert line record into REQUEST_MATERIALS\n"
        "  await tx.rEQUEST_MATERIALS.create({\n"
        "    data: { RequestID: requestId, MaterialID: materialId, QuantityUsed: quantityUsed },\n"
        "  });\n"
        "  \n"
        "  // 3. Automatically record financial cost in COST table\n"
        "  await tx.cOST.create({\n"
        "    data: {\n"
        "      RequestID: requestId,\n"
        "      CostType: 'Material',\n"
        "      Amount: Number(updatedMaterial.UnitCost) * quantityUsed,\n"
        "      IncurredDate: new Date(),\n"
        "    },\n"
        "  });\n"
        "});"
    )
    add_code_block(doc, tx_code)
    
    add_heading_styled(doc, "11.3 Validation and Error Handling", 2)
    val_points = [
        "Client-side and server-side validation for every input form.",
        "Technician assignment automatically sets technician status to 'Busy' and enforces valid availability.",
        "Quantity deducted from inventory is strictly validated against available stock in hand.",
        "Cascading relational deletes execute child row deletions first (Work Log -> Assignment -> Costs -> Materials -> Feedback -> Status History -> Request) to strictly prevent foreign key constraint violations.",
        "Database exceptions are captured in try-catch blocks and converted to user-friendly structured JSON error messages."
    ]
    for vp in val_points:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.add_run(vp)
        
    add_heading_styled(doc, "11.4 Project Structure", 2)
    proj_tree = (
        "DBMS-Course-project/\n"
        "├── Presentation-I/                     # Project inception slides (PDF)\n"
        "├── Presentation-II/                    # Database architecture review\n"
        "│   ├── database_setup.sql             # Full DDL schema creation and seed data\n"
        "│   ├── queries.sql                    # Comprehensive SQL evaluation queries\n"
        "│   └── er diagram.png                 # Relational schema architecture\n"
        "├── Presentation-III/                   # Final implementation and UI demonstration\n"
        "│   ├── README.md                      # UI demonstration guidelines\n"
        "│   └── source_code/                   # Complete Next.js fullstack application\n"
        "│       ├── app/api/                   # REST API routes (requests, infrastructure, analytics)\n"
        "│       ├── components/                # React UI components (Dashboard, Modals, Drawer)\n"
        "│       ├── prisma/                    # schema.prisma models and seed.ts script\n"
        "│       └── package.json               # Dependencies and scripts\n"
        "├── Project-Report/                     # Final project report documentation and DOCX\n"
        "└── README.md                          # Repository documentation and setup instructions"
    )
    add_code_block(doc, proj_tree)

    # -------------------------------------------------------------
    # 12. TESTING (TEST CASES AND RESULTS)
    # -------------------------------------------------------------
    add_heading_styled(doc, "12. Testing (Test Cases and Results)", 1)
    test_headers = ["Test Case", "Operation", "Input Parameters", "Expected Output", "Status"]
    test_data = [
        ["TC-01", "Database Connection", "Prisma client connects to MySQL", "Connection established with 15 tables loaded", "PASSED"],
        ["TC-02", "Create Ticket", "User: 1, Room: 101, Cat: 1, Prio: 4", "Row inserted into REQUESTS; initial log added to STATUS_HISTORY", "PASSED"],
        ["TC-03", "Assign Technician", "Request: 5001, Tech: 201", "Row inserted in ASSIGNMENT; Tech marked 'Busy'; Status -> 'Assigned'", "PASSED"],
        ["TC-04", "Log Labor Work", "Request: 5001, Hours: 2.5", "Entry created in WORK_LOG; Ticket status updated to 'In Progress'", "PASSED"],
        ["TC-05", "Consume Material", "Request: 5001, Material: 301, Qty: 2", "Stock decremented in MATERIALS; Voucher added to COST", "PASSED"],
        ["TC-06", "Submit Feedback", "Request: 5004, Rating: 5, Comments", "Star review recorded in FEEDBACK; Linked to ticket #5004", "PASSED"],
        ["TC-07", "Cascading Delete", "Delete ticket #5016", "Atomic transaction removes all child foreign key rows cleanly", "PASSED"],
        ["TC-08", "Presentation-II Query", "Filter user 'Ananya Rao'", "Returns Category, Priority, SLA, and Status in <1 ms", "PASSED"],
        ["TC-09", "Analytical Reports", "Execute /api/analytics", "Aggregated JSON returns all 6 mandatory management reports", "PASSED"],
        ["TC-10", "Infrastructure CRUD", "Add/Edit/Delete Room & Asset", "Changes reflected live across database and UI cards", "PASSED"]
    ]
    add_styled_table(doc, test_headers, test_data, col_widths=[0.8, 1.4, 1.7, 2.0, 0.8])

    # -------------------------------------------------------------
    # 13. CONCLUSION AND FUTURE ENHANCEMENTS
    # -------------------------------------------------------------
    add_heading_styled(doc, "13. Conclusion and Future Enhancements", 1)
    
    add_heading_styled(doc, "13.1 Conclusion", 2)
    p_conc = doc.add_paragraph()
    p_conc.paragraph_format.line_spacing = 1.2
    p_conc.paragraph_format.space_after = Pt(10)
    p_conc.add_run(
        "The Campus Facility Maintenance Request Management System provides a robust, normalized relational database solution "
        "for complaint logging, facility infrastructure tracking, technician dispatching, labor auditing, spare material control, and executive reporting. "
        "By enforcing 3NF schema constraints, foreign key relationships, atomic transactions, and comprehensive validation, the system eliminates duplicate entries, "
        "guarantees SLA adherence, and prevents data anomalies."
    )
    
    add_heading_styled(doc, "13.2 Future Enhancements", 2)
    enhancements = [
        "Role-based authentication and single sign-on (SSO) integration with university credentials.",
        "IoT sensor integration for automated leak detection and predictive electrical surge alerts.",
        "Real-time SMS and mobile push notifications for field technicians.",
        "Automated vendor purchase order generation when spare parts stock drops below safety thresholds.",
        "Predictive maintenance modeling using historical asset breakdown patterns.",
        "Cloud-native deployment on AWS/GCP with automated geo-redundant backups."
    ]
    for enh in enhancements:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.add_run(enh)

    # -------------------------------------------------------------
    # 14. REFERENCES
    # -------------------------------------------------------------
    add_heading_styled(doc, "14. References", 1)
    refs = [
        "Elmasri, R., & Navathe, S. B. Fundamentals of Database Systems, 7th Edition. Pearson, 2016.",
        "Silberschatz, A., Korth, H. F., & Sudarshan, S. Database System Concepts, 7th Edition. McGraw-Hill, 2019.",
        "MySQL 8.0 & 9.x Reference Manual. Oracle Corporation, 2024. https://dev.mysql.com/doc/",
        "Prisma ORM Documentation. Prisma Data, Inc. https://www.prisma.io/docs",
        "Next.js App Router Documentation. Vercel Inc. https://nextjs.org/docs",
        "Reference DBMS Course Project Report structure supplied for project documentation standards."
    ]
    for ref in refs:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        p.add_run(ref)

    # -------------------------------------------------------------
    # 15. APPENDIX: GITHUB REPOSITORY LINK
    # -------------------------------------------------------------
    add_heading_styled(doc, "15. Appendix: GitHub Repository Link", 1)
    p_app = doc.add_paragraph()
    p_app.paragraph_format.space_before = Pt(4)
    p_app.paragraph_format.space_after = Pt(12)
    p_app.add_run("GitHub Repository: ").bold = True
    r_link = p_app.add_run("https://github.com/mithijaiswal/DBMS-Course-project")
    r_link.font.underline = True
    r_link.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    # Save the document
    out_path = "/Users/mithijaiswal/Desktop/DBMS PBL/Project-Report/Campus_Facility_Maintenance_Project_Report.docx"
    doc.save(out_path)
    print("Report generated successfully at:", out_path)

if __name__ == "__main__":
    generate_report()
